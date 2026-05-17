'use client'

import { useChat } from './ChatProvider'
import { MessageList } from './MessageList'
import { Composer } from './Composer'
import { ScopeBar } from './ScopeBar'
import { BotIcon } from '@/src/components/icons'

export function ChatPanel() {
  const { state } = useChat()

  return (
    <aside className="chat-pane page-grid-col flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 border-b border-border-muted bg-surface shrink-0 h-11">
        {/* AI icon */}
        <BotIcon size={16} className="text-accent shrink-0" />
        <span className="text-base font-medium text-fg">
          Ask <span className="font-semibold text-accent">elenavoss</span>
        </span>
        {/* Connected indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-xs font-mono text-fg-dim">Connected</span>
        </div>
      </header>

      {/* Active scope chips */}
      <ScopeBar />

      {/* Scrollable message list */}
      <MessageList messages={state.messages} />

      {/* Pinned composer */}
      <Composer />
    </aside>
  )
}
