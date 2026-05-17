'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '@/src/types/chat'
import { UserMessage } from './UserMessage'
import { AssistantMessage } from './AssistantMessage'
import { useChat } from './ChatProvider'

export interface MessageListProps {
  messages: Message[]
}

const STARTER_CHIPS = [
  'What was your busiest week?',
  'Which repo got the most commits?',
  'Any unusual gaps in activity?',
]

export function MessageList({ messages }: MessageListProps) {
  const { sendMessage } = useChat()
  const containerRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  // True when the user is within 80px of the bottom — auto-scroll is active.
  const pinnedRef = useRef(true)

  // Track the pinned flag on scroll.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleScroll = () => {
      pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [])

  // Derive the last assistant message's reasoning length so the effect re-runs
  // on each new step (not just on new messages).
  const lastMsg = messages[messages.length - 1]
  const lastReasoningLen = lastMsg?.role === 'assistant' ? lastMsg.reasoning.length : 0

  useEffect(() => {
    if (pinnedRef.current) {
      sentinelRef.current?.scrollIntoView({ block: 'end', behavior: 'auto' })
    }
  }, [messages.length, lastReasoningLen])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 px-4 text-center">
        <p className="text-base text-fg">
          Ask anything about elenavoss&apos;s 365 days of activity.
        </p>
        <p className="text-sm text-fg-dim">
          Click a repo or contribution day to add it to context, or try one of these:
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {STARTER_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              className="text-xs border border-border-muted rounded-full px-3 py-1.5 text-fg-dim hover:border-border hover:text-fg transition-colors"
              onClick={() => sendMessage(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      role="log"
      aria-label="Conversation"
      aria-live="polite"
      className="flex flex-col gap-6 px-4 py-4 overflow-y-auto flex-1"
    >
      {messages.map((msg) =>
        msg.role === 'user' ? (
          <UserMessage key={msg.id} message={msg} />
        ) : (
          <AssistantMessage key={msg.id} message={msg} />
        ),
      )}
      {/* Scroll sentinel — auto-scroll lands just past the last message */}
      <div ref={sentinelRef} />
    </div>
  )
}
