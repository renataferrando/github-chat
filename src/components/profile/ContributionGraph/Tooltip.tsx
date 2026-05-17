'use client'

import { useState, useEffect } from 'react'
import type { ContributionDay } from '@/src/types/contributions'
import { formatDate } from '@/src/lib/utils'
import { ArrowClickIcon } from '@/src/components/icons'

export interface ContributionTooltipProps {
  day: ContributionDay | null
  position: { x: number; y: number } | null
  trailingAvg: number
}

function useViewportSize() {
  // Start with safe SSR defaults; useEffect syncs to real size on the client.
  const [size, setSize] = useState({ w: 1440, h: 900 })
  useEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

function topRepo(day: ContributionDay): string {
  if (day.count === 0) return '—'
  if (day.level >= 4) return 'elenavoss/tk-rs'
  if (day.level >= 2) return 'elenavoss/cells'
  return 'elenavoss/paper-cuts'
}

function splitCounts(count: number): {
  commits: number
  prs: number
  reviews: number
} {
  const commits = Math.max(0, Math.round(count * 0.75))
  const prs = Math.max(0, Math.round(count * 0.12))
  const reviews = Math.max(0, count - commits - prs)
  return { commits, prs, reviews }
}

export function ContributionTooltip({ day, position, trailingAvg }: ContributionTooltipProps) {
  const { w: windowW, h: windowH } = useViewportSize()

  const show = day !== null && position !== null

  if (!show) {
    return null
  }

  const PAD = 12
  const TIP_W = 236
  const TIP_H = 160

  const left = position.x + TIP_W + PAD > windowW ? position.x - TIP_W - PAD : position.x + PAD

  const top = position.y + TIP_H + PAD > windowH ? position.y - TIP_H - PAD : position.y + PAD

  const delta = day.count - trailingAvg
  const isPos = delta >= 0
  const deltaStr = `${isPos ? '+' : ''}${delta.toFixed(1)}`
  const { commits, prs, reviews } = splitCounts(day.count)

  return (
    <div
      role="tooltip"
      className="fixed z-50 bg-surface border border-border rounded-md shadow-xl pointer-events-none"
      style={{ left, top, width: TIP_W }}
    >
      <div className="p-3">
        {/* Top line */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-md font-semibold text-fg">
            <span className="text-success">{day.count}</span> contribution
            {day.count !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-fg-dim">{formatDate(day.date, 'short')}</span>
        </div>

        {/* Stats */}
        <div className="border-t border-border-muted pt-2 flex flex-col gap-1">
          <Row label="vs trailing 90d avg">
            <span className={isPos ? 'text-success' : 'text-danger'}>{deltaStr}</span>
          </Row>
          <Row label="top repo">
            <span className="text-fg font-medium truncate min-w-0">{topRepo(day)}</span>
          </Row>
          <Row label="commits / prs / reviews">
            <span className="text-fg">
              {commits} / {prs} / {reviews}
            </span>
          </Row>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-border-muted px-3 py-2 flex items-center gap-1.5 text-xs text-accent">
        <ArrowClickIcon size={11} />
        click to ask about this day
      </div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-fg-dim">{label}</span>
      {children}
    </div>
  )
}
