'use client'

import { useState, useRef } from 'react'
import { useChat } from './ChatProvider'

const MAX_LENGTH = 2000

export function Composer() {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { sendMessage } = useChat()

  const handleInput = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  const handleSend = () => {
    if (!value.trim()) return
    sendMessage(value)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border-muted px-4 py-3">
      <div className="border border-border rounded-md bg-surface focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-colors relative">
        {/* Sans placeholder — visible only when textarea is empty */}
        {value === '' && (
          <p className="absolute left-3 top-2.5 text-md text-fg-faint pointer-events-none select-none">
            Ask anything about elenavoss&apos;s 365 days.
          </p>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          maxLength={MAX_LENGTH}
          className="composer-textarea w-full bg-transparent px-3 py-2.5 text-base text-fg placeholder-transparent outline-none leading-relaxed"
          aria-label="Message composer"
          aria-multiline="true"
          onChange={(e) => setValue(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />

        <div className="flex items-center justify-between px-3 pb-2.5">
          <span className="text-xs font-mono text-fg-faint">⌘/Ctrl + ↵ to send</span>
          <div className="flex items-center gap-3">
            {value.length > 1500 && (
              <span
                className={`text-xs font-mono ${
                  value.length === MAX_LENGTH
                    ? 'text-danger'
                    : value.length >= 1900
                      ? 'text-warning'
                      : 'text-fg-faint'
                }`}
              >
                {value.length} / {MAX_LENGTH}
              </span>
            )}
            <button
              type="button"
              className="h-7 px-3 bg-success hover:bg-success/90 text-bg text-sm font-medium rounded-md flex items-center gap-1.5 disabled:opacity-40"
              disabled={!value.trim()}
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
