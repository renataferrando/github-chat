'use client'

import type { ChatScope } from '@/src/types/chat'
import { useChat } from './ChatProvider'
import { formatDate } from '@/src/lib/utils'
import { CalendarIcon, RepoIcon } from '@/src/components/icons'

function scopeKey(scope: ChatScope): string {
  if (scope.kind === 'day') return `day:${scope.date}`
  if (scope.kind === 'repo') return `repo:${scope.repoId}`
  return `window:${scope.from}:${scope.to}`
}

function scopeLabel(scope: ChatScope): string {
  if (scope.kind === 'day') return formatDate(scope.date, 'short')
  if (scope.kind === 'repo') return scope.repoName
  return `${scope.from} – ${scope.to}`
}

function ScopeChip({ scope, onRemove }: { scope: ChatScope; onRemove: () => void }) {
  const isRepo = scope.kind === 'repo'
  const colorClasses = isRepo
    ? 'bg-link/10 border-link/20 text-link'
    : 'bg-success/10 border-success/20 text-success'

  return (
    <span
      aria-label={`${scopeLabel(scope)} · in context`}
      className={`inline-flex items-center gap-1 text-xs font-mono border rounded-full px-2.5 py-0.5 ${colorClasses}`}
    >
      {isRepo ? (
        <RepoIcon size={10} className="shrink-0" />
      ) : (
        <CalendarIcon size={10} className="shrink-0" />
      )}
      {scopeLabel(scope)}
      <button
        type="button"
        aria-label={`Remove ${scopeLabel(scope)} scope`}
        className="ml-0.5 rounded-full opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent cursor-pointer"
        onClick={onRemove}
      >
        ×
      </button>
    </span>
  )
}

export function ScopeBar() {
  const { state, removeScope, clearScopes } = useChat()
  if (state.scopes.length === 0) return null

  return (
    <div className="border-b border-border-muted px-4 pt-2.5 pb-2" aria-label="Active scopes">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-fg-faint uppercase tracking-wider">In context</span>
        <button
          type="button"
          className="text-xs text-fg-faint hover:text-danger transition-colors cursor-pointer"
          onClick={clearScopes}
        >
          Clear all
        </button>
      </div>
      <ul role="list" className="flex flex-wrap gap-2">
        {state.scopes.map((scope) => (
          <li key={scopeKey(scope)}>
            <ScopeChip scope={scope} onRemove={() => removeScope(scope)} />
          </li>
        ))}
      </ul>
    </div>
  )
}
