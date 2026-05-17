'use client'

import type { ReactNode } from 'react'
import type { AssistantMessage as AssistantMessageData } from '@/src/types/chat'
import { ReasoningTrace } from './ReasoningTrace'
import { FiguresCard } from './FiguresCard'
import { useChat } from './ChatProvider'
import { BotIcon } from '@/src/components/icons'

export interface AssistantMessageProps {
  message: AssistantMessageData
}

// ─── Minimal markdown renderer ────────────────────────────────────────────────
// Handles **bold** and `code` only — sufficient for the canned answer.
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-fg">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="font-mono text-sm bg-surface-2 px-1 rounded-sm text-fg">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

function renderAnswer(answer: string): ReactNode {
  return answer.split('\n\n').map((para, i) => (
    <p key={i} className={i > 0 ? 'mt-3' : ''}>
      {renderInline(para)}
    </p>
  ))
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AssistantMessage({ message }: AssistantMessageProps) {
  const { sendMessage, stopStreaming, setHighlightedCells } = useChat()

  const isActive = message.status === 'thinking' || message.status === 'streaming'
  const showAnswer =
    message.answer !== '' && (message.status === 'done' || message.status === 'stopped')
  const showFollowups = message.status === 'done' && message.followups.length > 0

  return (
    <article className="flex gap-3 items-start">
      {/* Bot avatar glyph */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-surface-2 border border-border shrink-0 text-accent">
        <BotIcon size={14} />
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

        {/* Figures card — shown when stream completes */}
        {message.status === 'done' && message.figures && message.figures.length > 0 && (
          <FiguresCard figures={message.figures} />
        )}

        {/* Answer — revealed once done or stopped */}
        {showAnswer && (
          <div className="text-base text-fg leading-relaxed">{renderAnswer(message.answer)}</div>
        )}

        {/* Followup chips — only when fully done */}
        {showFollowups && (
          <div className="flex flex-wrap gap-2 mt-4">
            {message.followups.map((q) => (
              <button
                key={q}
                type="button"
                className="text-xs border border-border-muted rounded-full px-3 py-1.5 text-fg-dim hover:border-border hover:text-fg transition-colors cursor-pointer"
                onClick={() => sendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
