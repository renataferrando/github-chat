'use client'

import type { ContributionYear } from '@/src/types/contributions'
import type { Repo } from '@/src/types/profile'
import { useChat } from '../chat/ChatProvider'
import { CalendarIcon, ArrowClickIcon, RepoIcon } from '@/src/components/icons'
import { SPRINT_PEAK_DATE, SPRINT_WEEK_DATES } from '@/src/lib/mockContributions'

export interface InsightsPanelProps {
  contributions: ContributionYear
  repos: Repo[]
}

export function InsightsPanel({ contributions, repos }: InsightsPanelProps) {
  const { sendMessage, addScope, setHighlightedCells } = useChat()

  // Derive busiest day from the mocked data
  const peakDay = contributions.days.reduce(
    (best, d) => (d.count > best.count ? d : best),
    contributions.days[0] ?? { date: SPRINT_PEAK_DATE, count: 0, level: 0 },
  )

  // First pinned repo (mock heuristic — no real activity ranking).
  const topRepo = repos[0]

  const insights = [
    {
      icon: <CalendarIcon size={12} className="shrink-0 text-fg-faint" />,
      text: `Busiest day: Tue Mar 10 (${peakDay.count} contribs)`,
      onActivate() {
        setHighlightedCells([SPRINT_PEAK_DATE])
        addScope({ kind: 'day', date: SPRINT_PEAK_DATE })
        sendMessage(`What happened on ${SPRINT_PEAK_DATE}?`)
      },
    },
    {
      icon: <ArrowClickIcon size={12} className="shrink-0 text-fg-faint" />,
      text: 'Sprint week: Mar 8–14 (avg 14.4/day)',
      onActivate() {
        setHighlightedCells([...SPRINT_WEEK_DATES])
        sendMessage('Was Mar 8–14 a release sprint?')
      },
    },
    {
      icon: <RepoIcon size={12} className="shrink-0 text-fg-faint" />,
      text: `Top repo activity: ${topRepo?.name ?? 'tk-rs'}`,
      onActivate() {
        if (topRepo) {
          addScope({ kind: 'repo', repoId: topRepo.id, repoName: topRepo.name })
        }
        sendMessage('Which repo drove the most commits?')
      },
    },
  ]

  return (
    <div className="bg-surface border border-border-muted rounded-md p-3 mt-6 border-t-accent">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-fg-faint">
          AI insights
        </span>
        <span className="text-xs border border-accent/30 text-accent rounded-full px-2 py-px">
          auto · 365 d
        </span>
      </div>

      {/* Insight rows */}
      <ul role="list" className="flex flex-col gap-1">
        {insights.map((ins, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={ins.onActivate}
              className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded text-xs text-fg-dim hover:bg-surface-2 hover:text-fg transition-colors group"
            >
              {ins.icon}
              <span className="flex-1 min-w-0 truncate">{ins.text}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent text-xs shrink-0">
                → ask
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
