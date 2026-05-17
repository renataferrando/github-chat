import type { ContributionDay, HeatLevel } from '@/src/types/contributions'
import { AVATAR_PALETTE, AVATAR_OVERRIDES } from '@/src/lib/tokens'

// ─── Deterministic PRNG (Mulberry32) ─────────────────────────────────────────

export function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Avatar color ─────────────────────────────────────────────────────────────

export function avatarColor(username: string): string {
  if (AVATAR_OVERRIDES[username] !== undefined) return AVATAR_OVERRIDES[username]
  let hash = 5381
  for (let i = 0; i < username.length; i++) {
    hash = ((hash << 5) + hash + username.charCodeAt(i)) | 0
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length]
}

// ─── Date formatting ──────────────────────────────────────────────────────────

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const
const MONTH_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export function formatDate(iso: string, format: 'short' | 'long'): string {
  const d = new Date(iso + 'T00:00:00Z')
  const dow = d.getUTCDay()
  const mon = d.getUTCMonth()
  const day = d.getUTCDate()
  const yr = d.getUTCFullYear()

  if (format === 'short') {
    return `${DAY_SHORT[dow]} · ${MONTH_SHORT[mon]} ${day}`
  }
  return `${DAY_SHORT[dow]}, ${MONTH_LONG[mon]} ${day}, ${yr}`
}

// ─── Heat level ───────────────────────────────────────────────────────────────

export function getContributionLevel(count: number): HeatLevel {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 7) return 2
  if (count <= 14) return 3
  return 4
}

// ─── Month labels ─────────────────────────────────────────────────────────────

export type MonthLabel = {
  label: string
  /** 0-based column (week) index where the label should appear */
  weekIndex: number
}

/**
 * Computes month labels for the contribution graph.
 * Requires a gap of ≥ 2 weeks from the previous label to avoid overlap.
 * May silently skip a month if its start week is too close to the prior label.
 */
export function computeMonthLabels(days: ContributionDay[]): MonthLabel[] {
  const numWeeks = Math.ceil(days.length / 7)
  const labels: MonthLabel[] = []
  let lastMonth = -1
  let prevAnchor = -3 // allow first label even at w=0

  for (let w = 0; w < numWeeks; w++) {
    const dayIdx = w * 7
    if (dayIdx >= days.length) break

    const d = new Date(days[dayIdx].date + 'T00:00:00Z')
    const month = d.getUTCMonth()

    if (month !== lastMonth) {
      if (w - prevAnchor >= 2) {
        labels.push({ label: MONTH_SHORT[month], weekIndex: w })
        prevAnchor = w
      }
      lastMonth = month
    }
  }

  return labels
}

// ─── Trailing average ─────────────────────────────────────────────────────────

/**
 * Returns the average daily contribution count for the `windowDays` days
 * immediately before `beforeDate` in the dataset.
 */
export function trailingAverage(
  days: ContributionDay[],
  beforeDate: string,
  windowDays: number,
): number {
  const idx = days.findIndex((d) => d.date === beforeDate)
  if (idx < 0) return 0
  const start = Math.max(0, idx - windowDays)
  const slice = days.slice(start, idx)
  if (slice.length === 0) return 0
  return slice.reduce((sum, d) => sum + d.count, 0) / slice.length
}

// ─── Short date (no day-of-week) ─────────────────────────────────────────────

/** "May 11 2025" */
export function formatDateShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return `${MONTH_SHORT[d.getUTCMonth()]} ${d.getUTCDate()} ${d.getUTCFullYear()}`
}

// ─── Compact number formatting ────────────────────────────────────────────────

export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}
