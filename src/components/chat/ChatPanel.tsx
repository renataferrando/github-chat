"use client";

import { useChat } from "./ChatProvider";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";
import { ScopeBar } from "./ScopeBar";

export function ChatPanel() {
  const { state } = useChat();

  return (
    <aside className="chat-pane page-grid-col flex flex-col bg-bg overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-2 px-4 border-b border-border-muted bg-surface flex-shrink-0 h-11">
        {/* AI icon */}
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="currentColor"
          className="text-accent flex-shrink-0"
        >
          <path d="M11 13.5h.34a.75.75 0 0 1 0 1.5H4.66a.75.75 0 0 1 0-1.5H5v-2.293A6 6 0 0 1 .75 5.5a.75.75 0 0 1 1.5 0 4.5 4.5 0 0 0 9 0 .75.75 0 0 1 1.5 0 6 6 0 0 1-4.25 5.707V13.5H11ZM8 0a3.5 3.5 0 0 1 3.5 3.5v3a3.5 3.5 0 1 1-7 0v-3A3.5 3.5 0 0 1 8 0Z" />
        </svg>
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
  );
}
