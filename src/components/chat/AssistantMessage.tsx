"use client";

import type { AssistantMessage as AssistantMessageData } from "@/src/types/chat";
import { ReasoningTrace } from "./ReasoningTrace";
import { useChat } from "./ChatProvider";

export interface AssistantMessageProps {
  message: AssistantMessageData;
}

// ─── Minimal markdown renderer ────────────────────────────────────────────────
// Handles **bold** and `code` only — sufficient for the canned answer.
function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-fg">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="font-mono text-sm bg-surface-2 px-1 rounded-sm text-fg"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function renderAnswer(answer: string): React.ReactNode {
  return answer.split("\n\n").map((para, i) => (
    <p key={i} className={i > 0 ? "mt-3" : ""}>
      {renderInline(para)}
    </p>
  ));
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AssistantMessage({ message }: AssistantMessageProps) {
  const { stopStreaming, setHighlightedCells } = useChat();

  const isActive =
    message.status === "thinking" || message.status === "streaming";
  const showAnswer =
    message.answer !== "" &&
    (message.status === "done" || message.status === "stopped");
  const showFollowups =
    message.status === "done" && message.followups.length > 0;

  return (
    <article role="article" className="flex gap-3 items-start">
      {/* Bot avatar glyph */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-surface-2 border border-border flex-shrink-0 text-accent">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M7.998 14.5c2.832 0 5.002-2.124 5.002-5.5C13 6.07 10.916 4.5 8 4.5 5.083 4.5 3 6.07 3 9c0 3.376 2.166 5.5 4.998 5.5ZM5.965 11.6a.5.5 0 1 1 .714-.7l.045.05A1 1 0 0 0 7.5 11.2c.345 0 .61-.135.776-.25l.045-.05a.5.5 0 0 1 .714.7l-.06.067A2 2 0 0 1 7.5 12.2a2 2 0 0 1-1.475-.533Z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-semibold text-fg">Copilot</span>
          <span className="font-mono text-xs text-accent bg-surface-2 border border-border-muted px-1.5 py-px rounded-sm">
            haiku-4.5
          </span>
        </div>

        {/* Reasoning trace — fed by ChatProvider's reducer state */}
        <ReasoningTrace
          steps={message.reasoning}
          status={message.status}
          onStop={isActive ? () => stopStreaming(message.id) : undefined}
          onStepClick={setHighlightedCells}
        />

        {/* Answer — revealed once done or stopped */}
        {showAnswer && (
          <div className="text-base text-fg leading-relaxed">
            {renderAnswer(message.answer)}
          </div>
        )}

        {/* Followup chips — only when fully done */}
        {showFollowups && (
          <div className="flex flex-wrap gap-2 mt-4">
            {message.followups.map((q) => (
              <button
                key={q}
                type="button"
                className="text-xs border border-border-muted rounded-full px-3 py-1.5 text-fg-dim hover:border-border hover:text-fg transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
