import type {
  ChatState,
  ChatAction,
  Message,
  AssistantMessage,
  ChatScope,
} from '@/src/types/chat'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Update one assistant message inside a messages array (immutable). */
function updateAssistant(
  messages: Message[],
  id: string,
  updater: (msg: AssistantMessage) => AssistantMessage,
): Message[] {
  return messages.map(m =>
    m.id === id && m.role === 'assistant' ? updater(m) : m,
  )
}

/** True when two scopes refer to the same logical entity. */
function scopesMatch(a: ChatScope, b: ChatScope): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === 'day'    && b.kind === 'day')    return a.date === b.date
  if (a.kind === 'repo'   && b.kind === 'repo')   return a.repoId === b.repoId
  if (a.kind === 'window' && b.kind === 'window') return a.from === b.from && a.to === b.to
  return false
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function initialChatState(messages: Message[]): ChatState {
  return { messages, status: 'idle', scopes: [], highlightedCells: [] }
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SEND_MESSAGE': {
      const userMsg = action.payload
      // Create a blank thinking assistant message; the provider will stream into it.
      const assistantMsg: AssistantMessage = {
        id:        crypto.randomUUID(),
        role:      'assistant',
        status:    'thinking',
        reasoning: [],
        answer:    '',
        followups: [],
        timestamp: Date.now(),
      }
      return {
        ...state,
        messages: [...state.messages, userMsg, assistantMsg],
        status:   'streaming',
        scopes:   [], // chips attached to the user message; clear the bar
      }
    }

    case 'BEGIN_RESPONSE':
      return {
        ...state,
        messages: updateAssistant(state.messages, action.payload.id, m => ({
          ...m, status: 'streaming',
        })),
      }

    case 'REASONING_STEP':
      return {
        ...state,
        messages: updateAssistant(state.messages, action.payload.msgId, m => ({
          ...m, reasoning: [...m.reasoning, action.payload.step],
        })),
      }

    case 'ANSWER_CHUNK':
      // Not used in Stage 4 (canned answer is single-shot via FINISH),
      // but included so the reducer is total over ChatAction.
      return {
        ...state,
        messages: updateAssistant(state.messages, action.payload.msgId, m => ({
          ...m, answer: m.answer + action.payload.chunk,
        })),
      }

    case 'FINISH':
      return {
        ...state,
        messages: updateAssistant(state.messages, action.payload.msgId, m => ({
          ...m,
          status:    'done',
          answer:    action.payload.answer,
          followups: action.payload.followups,
        })),
        status: 'idle',
      }

    case 'STOP':
      return {
        ...state,
        messages: updateAssistant(state.messages, action.payload.msgId, m => ({
          ...m, status: 'stopped',
        })),
        status: 'idle',
      }

    case 'ERROR':
      return {
        ...state,
        messages: updateAssistant(state.messages, action.payload.msgId, m => ({
          ...m,
          status: 'error',
          answer: `[error] ${action.payload.error}`,
        })),
        status: 'idle',
      }

    case 'ADD_SCOPE': {
      const scope = action.payload
      if (state.scopes.some(s => scopesMatch(s, scope))) return state
      return { ...state, scopes: [...state.scopes, scope] }
    }

    case 'REMOVE_SCOPE': {
      const target = action.payload
      return {
        ...state,
        scopes: state.scopes.filter(s => !scopesMatch(s, target)),
      }
    }

    case 'SET_HIGHLIGHTED':
      return { ...state, highlightedCells: action.payload }

    default:
      return state
  }
}
