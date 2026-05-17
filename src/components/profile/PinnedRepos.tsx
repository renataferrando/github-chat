'use client'

import type { Repo } from '@/src/types/profile'
import { RepoCard } from './RepoCard'
import { useChat } from '../chat/ChatProvider'

export interface PinnedReposProps {
  repos: Repo[]
}

export function PinnedRepos({ repos }: PinnedReposProps) {
  const { addScope } = useChat()

  const handleCardClick = (repo: Repo) => {
    addScope({ kind: 'repo', repoId: repo.id, repoName: repo.name })
  }

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold text-fg">
        Popular repositories
        <span className="text-xs font-normal text-fg-dim ml-2">
          · click a card to scope the conversation
        </span>
      </h2>
      {repos.length === 0 ? (
        <p className="text-sm text-fg-dim mt-4">No pinned repositories yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-4">
          {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} onClick={handleCardClick} />
          ))}
        </div>
      )}
    </div>
  )
}
