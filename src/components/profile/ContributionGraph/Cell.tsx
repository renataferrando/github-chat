import type { ContributionDay } from '@/src/types/contributions'
import { formatDate } from '@/src/lib/utils'

// Static class names — full strings required for Tailwind build-time detection.
const HEAT_BG: Record<ContributionDay['level'], string> = {
  0: 'bg-heat-0',
  1: 'bg-heat-1',
  2: 'bg-heat-2',
  3: 'bg-heat-3',
  4: 'bg-heat-4',
}

// Level-0 cells get a transparent border so they recede into the panel bg.
const CELL_EXTRA: Record<ContributionDay['level'], string> = {
  0: 'contrib-cell-empty',
  1: '',
  2: '',
  3: '',
  4: '',
}

export interface CellProps {
  day: ContributionDay
  /** Column (week) index 0-52, drives CSS stagger animation delay */
  colIndex: number
  isHighlighted: boolean
  onMouseEnter: (day: ContributionDay, x: number, y: number) => void
  onMouseLeave: () => void
  onClick: (day: ContributionDay) => void
}

export function ContributionCell({
  day,
  colIndex,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: CellProps) {
  const heatClass  = HEAT_BG[day.level]
  const extraClass = CELL_EXTRA[day.level]
  const hlClass    = isHighlighted ? 'contrib-cell-hl' : ''

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    onMouseEnter(day, e.clientX, e.clientY)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(day)
    }
  }

  return (
    <div
      role="gridcell"
      tabIndex={-1}
      aria-label={`${day.count} contribution${day.count !== 1 ? 's' : ''} on ${formatDate(day.date, 'long')}`}
      className={`contrib-cell cell-animate ${heatClass} ${extraClass} ${hlClass}`}
      // --col is a dynamic CSS variable (column index), feeds animation-delay
      style={{ '--col': colIndex } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick(day)}
      onKeyDown={handleKeyDown}
    />
  )
}
