'use client'

import { useState, useRef, useEffect } from 'react'
import type { ContributionDay, ContributionYear } from '@/src/types/contributions'
import { computeMonthLabels, trailingAverage } from '@/src/lib/utils'
import { ContributionCell } from './Cell'
import { ContributionTooltip } from './Tooltip'
import { ContributionLegend } from './Legend'

export interface ContributionGraphProps {
  data: ContributionYear
  onDayClick: (day: ContributionDay) => void
  highlightedDates?: ReadonlySet<string>
}

type TooltipState = {
  day: ContributionDay
  x: number
  y: number
  trailingAvg: number
} | null

// Day labels: only Mon, Wed, Fri are visible; others are invisible for spacing.
const DAY_LABELS: Array<{ label: string; visible: boolean }> = [
  { label: 'Sun', visible: false },
  { label: 'Mon', visible: true },
  { label: 'Tue', visible: false },
  { label: 'Wed', visible: true },
  { label: 'Thu', visible: false },
  { label: 'Fri', visible: true },
  { label: 'Sat', visible: false },
]

export function ContributionGraph({ data, onDayClick, highlightedDates }: ContributionGraphProps) {
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  // ── Roving tabindex state (Stage 5) ────────────────────────────────────────
  const [focusedIndex, setFocusedIndex] = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)
  // Prevents the heatmap from stealing focus on initial load.
  const hasInteracted = useRef(false)

  // When focusedIndex changes imperatively (arrow keys), move focus to the
  // corresponding cell element in the DOM — but only after the user has
  // tabbed into the heatmap at least once.
  useEffect(() => {
    if (!hasInteracted.current) return
    const cells = gridRef.current?.querySelectorAll<HTMLElement>('.contrib-cell')
    cells?.[focusedIndex]?.focus({ preventScroll: true })
  }, [focusedIndex])

  const numWeeks = Math.ceil(data.days.length / 7)
  const cellCount = data.days.length

  const monthLabels = computeMonthLabels(data.days)
  const labelByWeek = new Map(monthLabels.map((m) => [m.weekIndex, m.label]))

  const handleMouseEnter = (day: ContributionDay, x: number, y: number) => {
    setTooltip({
      day,
      x,
      y,
      trailingAvg: trailingAverage(data.days, day.date, 90),
    })
  }

  const handleMouseLeave = () => setTooltip(null)

  // Arrow-key navigation for the heatmap grid.
  // Layout: cells are ordered in day-major order (flat array) rendered column-by-column.
  // ArrowRight/Left moves one week (7 days); ArrowDown/Up moves one day.
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next = focusedIndex
    switch (e.key) {
      case 'ArrowRight':
        next = Math.min(focusedIndex + 7, cellCount - 1)
        break
      case 'ArrowLeft':
        next = Math.max(focusedIndex - 7, 0)
        break
      case 'ArrowDown':
        next = Math.min(focusedIndex + 1, cellCount - 1)
        break
      case 'ArrowUp':
        next = Math.max(focusedIndex - 1, 0)
        break
      default:
        return
    }
    hasInteracted.current = true
    e.preventDefault()
    setFocusedIndex(next)
  }

  return (
    <div>
      {/* Wrapper: day-of-week labels + graph */}
      <div className="contrib-wrapper">
        {/* Day labels column */}
        <div className="contrib-days-col" aria-hidden="true">
          {DAY_LABELS.map(({ label, visible }) => (
            <span key={label} className={visible ? 'text-fg-faint font-mono' : 'invisible'}>
              {label}
            </span>
          ))}
        </div>

        {/* Month labels + grid */}
        <div>
          {/* Month labels row */}
          <div className="contrib-months" aria-hidden="true">
            {Array.from({ length: numWeeks }, (_, w) => (
              <span key={w} className="contrib-month-label">
                {labelByWeek.get(w) ?? ''}
              </span>
            ))}
          </div>

          {/* Heatmap grid — keyboard navigation via roving tabindex (Stage 5). */}
          <div
            ref={gridRef}
            aria-label="Contribution heatmap, use arrow keys to navigate"
            onKeyDown={handleGridKeyDown}
          >
            <div className="contrib-grid">
              {data.days.map((day, i) => (
                <ContributionCell
                  key={day.date}
                  day={day}
                  colIndex={Math.floor(i / 7)}
                  isHighlighted={highlightedDates?.has(day.date) ?? false}
                  tabIndex={i === focusedIndex ? 0 : -1}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onClick={onDayClick}
                  onFocus={() => setFocusedIndex(i)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <ContributionLegend />
          </div>
        </div>
      </div>

      {/* Tooltip (position: fixed, outside any stacking contexts) */}
      <ContributionTooltip
        day={tooltip?.day ?? null}
        position={tooltip ? { x: tooltip.x, y: tooltip.y } : null}
        trailingAvg={tooltip?.trailingAvg ?? 0}
      />
    </div>
  )
}
