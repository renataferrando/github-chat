'use client'

import type { Repo } from '@/src/types/profile'
import { formatCount } from '@/src/lib/utils'

export interface RepoCardProps {
  repo: Repo
  onClick: (repo: Repo) => void
}

export function RepoCard({ repo, onClick }: RepoCardProps) {
  return (
    <div
      className="bg-surface border border-border-muted rounded-md p-3 flex flex-col gap-2 cursor-pointer hover:border-border transition-colors"
      onClick={() => onClick(repo)}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(repo)
        }
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-2 min-w-0">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" className="flex-shrink-0 text-fg-faint">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
        </svg>
        <span className="text-base font-semibold text-link truncate min-w-0">
          {repo.name}
        </span>
        <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
          {repo.isFork && (
            <span className="text-xs text-fg-faint border border-border-muted rounded-full px-2 py-px">
              Fork
            </span>
          )}
          <span className="text-xs text-fg-faint border border-border-muted rounded-full px-2 py-px">
            Public
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-fg-dim line-clamp-2 leading-relaxed">
        {repo.description}
      </p>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-sm text-fg-dim mt-auto">
        {/* Language */}
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block rounded-full flex-shrink-0"
            style={{ width: 10, height: 10, backgroundColor: repo.language.color }}
          />
          {repo.language.name}
        </span>

        {/* Stars */}
        {repo.stars > 0 && (
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
            </svg>
            {formatCount(repo.stars)}
          </span>
        )}

        {/* Forks */}
        {repo.forks > 0 && (
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
              <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
            </svg>
            {formatCount(repo.forks)}
          </span>
        )}
      </div>
    </div>
  )
}
