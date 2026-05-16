'use client'

import { useState, useRef } from 'react'
import { useChat } from './ChatProvider'

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
        {/* Fraunces italic placeholder — visible only when textarea is empty */}
        {value === '' && (
          <p className="absolute left-3 top-2.5 text-md text-fg-faint pointer-events-none select-none font-display italic">
            Ask anything about elenavoss&apos;s 365 days.
          </p>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          className="composer-textarea w-full bg-transparent px-3 py-2.5 text-base text-fg placeholder-transparent outline-none font-sans leading-relaxed"
          aria-label="Message composer"
          aria-multiline="true"
          onChange={e => setValue(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
        />

        <div className="flex items-center justify-between px-3 pb-2.5">
          <span className="text-xs font-mono text-fg-faint">⌘/Ctrl + ↵ to send</span>
          <button
            type="button"
            className="h-7 px-3 bg-success hover:bg-success/90 text-white text-sm font-medium rounded-md flex items-center gap-1.5 disabled:opacity-40"
            disabled={!value.trim()}
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
