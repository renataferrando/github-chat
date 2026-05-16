"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useMemo,
  useRef,
} from "react";
import type {
  AssistantMessage,
  ChatContextValue,
  ChatScope,
  Message,
} from "@/src/types/chat";
import { chatReducer, initialChatState } from "@/src/lib/chatReducer";
import { CANNED_ASSISTANT, streamReasoning } from "@/src/lib/mockChat";

// ─── Context ─────────────────────────────────────────────────────────────────

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface ChatProviderProps {
  initialMessages: Message[];
  children: React.ReactNode;
}

type FlightController = AbortController & { userInitiated?: boolean };

export function ChatProvider({ initialMessages, children }: ChatProviderProps) {
  const [state, dispatch] = useReducer(
    chatReducer,
    initialMessages,
    initialChatState,
  );

  // Stable Map of active streams — keyed by assistant message id.
  const inFlight = useRef(new Map<string, FlightController>());

  // Keep a ref to the latest state so sendMessage can read scopes without
  // a stale closure. Updated in an effect (never during render).
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  // ── Streaming effect ──────────────────────────────────────────────────────
  // Fires whenever state.messages changes. Finds the latest 'thinking' assistant
  // message that isn't already in-flight and drives a new stream for it.
  useEffect(() => {
    const thinkingMsg = [...state.messages]
      .reverse()
      .find(
        (m): m is AssistantMessage =>
          m.role === "assistant" && m.status === "thinking",
      );

    // StrictMode guard: the second invocation sees the id already in inFlight.
    if (!thinkingMsg || inFlight.current.has(thinkingMsg.id)) return;

    const msgId = thinkingMsg.id;
    const ctrl = new AbortController() as FlightController;
    inFlight.current.set(msgId, ctrl);

    const run = async () => {
      try {
        dispatch({ type: "BEGIN_RESPONSE", payload: { id: msgId } });

        for await (const step of streamReasoning(
          CANNED_ASSISTANT.reasoning,
          ctrl.signal,
        )) {
          dispatch({ type: "REASONING_STEP", payload: { msgId, step } });
        }

        dispatch({
          type: "FINISH",
          payload: {
            msgId,
            answer: CANNED_ASSISTANT.answer,
            followups: CANNED_ASSISTANT.followups,
          },
        });
      } catch (e) {
        if ((e as DOMException).name === "AbortError") {
          // Only surface STOP when the user pressed the Stop button.
          // StrictMode cleanup aborts (userInitiated is unset) are swallowed.
          if (ctrl.userInitiated) {
            dispatch({ type: "STOP", payload: { msgId } });
          }
        } else {
          dispatch({ type: "ERROR", payload: { msgId, error: String(e) } });
        }
      } finally {
        inFlight.current.delete(msgId);
      }
    };

    run();
    // No return cleanup here — we do NOT abort on re-render (state.messages
    // changes on every step dispatch). Unmount cleanup lives below.
  }, [state.messages]);

  // ── Unmount cleanup ───────────────────────────────────────────────────────
  useEffect(() => {
    // Capture the map reference so the closure is stable for cleanup.
    const map = inFlight.current;
    return () => {
      for (const ctrl of map.values()) {
        ctrl.abort(); // cleanup abort — userInitiated stays false, no STOP dispatched
      }
      map.clear();
    };
  }, []);

  // ── Stable context callbacks ──────────────────────────────────────────────

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    dispatch({
      type: "SEND_MESSAGE",
      payload: {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        scopes: [...stateRef.current.scopes],
        timestamp: Date.now(),
      },
    });
  }, []);

  const stopStreaming = useCallback((msgId?: string) => {
    for (const [id, ctrl] of inFlight.current.entries()) {
      if (msgId !== undefined && id !== msgId) continue;
      ctrl.userInitiated = true;
      ctrl.abort();
    }
  }, []);

  const addScope = useCallback((scope: ChatScope) => {
    dispatch({ type: "ADD_SCOPE", payload: scope });
  }, []);

  const removeScope = useCallback((scope: ChatScope) => {
    dispatch({ type: "REMOVE_SCOPE", payload: scope });
  }, []);

  const setHighlightedCells = useCallback((dates: string[]) => {
    dispatch({ type: "SET_HIGHLIGHTED", payload: dates });
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      state,
      sendMessage,
      stopStreaming,
      addScope,
      removeScope,
      setHighlightedCells,
    }),
    [
      state,
      sendMessage,
      stopStreaming,
      addScope,
      removeScope,
      setHighlightedCells,
    ],
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
