'use client'

import type { Repo } from '@/src/types/profile'
import { formatCount } from '@/src/lib/utils'
import { ForkIcon, RepoIcon, StarIcon } from '@/src/components/icons'

export interface RepoCardProps {
  repo: Repo
  onClick: (repo: Repo) => void
}

export function RepoCard({ repo, onClick }: RepoCardProps) {
  return (
    <div
      className="group relative bg-surface border border-border-muted rounded-md p-3 flex flex-col gap-2 cursor-pointer transition-colors hover:bg-surface-2 hover:border-border focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent overflow-hidden"
      onClick={() => onClick(repo)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(repo)
        }
      }}
    >
      {/* Top row */}
      <div className="flex items-center gap-2 min-w-0">
        <RepoIcon size={14} className="shrink-0 text-fg-faint" />
        <span className="text-base font-semibold text-link truncate min-w-0">{repo.name}</span>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
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
      <p className="text-sm text-fg-dim line-clamp-2 leading-relaxed">{repo.description}</p>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-sm text-fg-dim mt-auto">
        {/* Language */}
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block rounded-full shrink-0"
            style={{ width: 10, height: 10, backgroundColor: repo.language.color }}
          />
          {repo.language.name}
        </span>

        {/* Stars */}
        {repo.stars > 0 && (
          <span className="flex items-center gap-1">
            <StarIcon size={12} />
            {formatCount(repo.stars)}
          </span>
        )}

        {/* Forks */}
        {repo.forks > 0 && (
          <span className="flex items-center gap-1">
            <ForkIcon size={12} />
            {formatCount(repo.forks)}
          </span>
        )}
      </div>

      {/* "Add to context" — in-flow so it never covers card content */}
      <div className="flex items-center justify-center gap-1 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs text-accent font-medium border-t border-transparent group-hover:border-border-muted -mx-3 -mb-3 px-3">
        + Add to context
      </div>
    </div>
  )
}
