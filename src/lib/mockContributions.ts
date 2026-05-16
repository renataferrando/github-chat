import type { ContributionDay, ContributionYear } from '@/src/types/contributions'
import { seededRandom, getContributionLevel } from '@/src/lib/utils'

// ─── Date constants ───────────────────────────────────────────────────────────
//
// "Today" is fixed at 2026-05-15 for determinism.
//   2026-05-15 - 364 days = 2025-05-16 (Friday)
//   Snap to prior Sunday   = 2025-05-11
//
// Indexing: days[0].date = "2025-05-11", days[364].date = "2026-05-10"
// Week/column index: w = Math.floor(dayIndex / 7)
// Day-of-week offset: d = dayIndex % 7  (0=Sun … 6=Sat)

const START_MS  = Date.UTC(2025, 4, 11) // 2025-05-11T00:00:00Z
const NUM_DAYS  = 365

// Sprint week: w=43 (Sun 2026-03-08 … Sat 2026-03-14)
//   day[301]=Mar8, day[302]=Mar9, day[303]=Mar10(peak), …
const SPRINT_OVERRIDES: Readonly<Record<number, number>> = {
  301: 3,  // Sun Mar 8
  302: 16, // Mon Mar 9
  303: 23, // Tue Mar 10 ← peak
  304: 19, // Wed Mar 11
  305: 11, // Thu Mar 12
  306: 7,  // Fri Mar 13
  307: 2,  // Sat Mar 14
}

// Vacation: 2025-08-18 → 2025-09-14 (days 99-126, 4 weeks)
//   day[82]=Aug1, day[99]=Aug18, day[126]=Sep14
const VACATION_START = 99
const VACATION_END   = 126

// ─── Generator ────────────────────────────────────────────────────────────────

export function generateContributions(): ContributionYear {
  const rand = seededRandom(42)
  const numWeeks = Math.ceil(NUM_DAYS / 7)

  const days: ContributionDay[] = []
  let total = 0

  for (let i = 0; i < NUM_DAYS; i++) {
    const date     = new Date(START_MS + i * 86_400_000)
    const iso      = date.toISOString().slice(0, 10)
    const dow      = date.getUTCDay()            // 0=Sun, 6=Sat
    const weekIdx  = Math.floor(i / 7)
    const isWeekend = dow === 0 || dow === 6

    let count = 0

    if (i in SPRINT_OVERRIDES) {
      count = SPRINT_OVERRIDES[i]
    } else if (i >= VACATION_START && i <= VACATION_END) {
      count = 0
    } else {
      // Upward trend: recent weeks are ~40% more active than early weeks
      const trend = 0.6 + 0.4 * (weekIdx / numWeeks)

      if (isWeekend) {
        // Weekends: mostly zero, occasionally 1-2
        count = rand() < 0.78 ? 0 : Math.floor(rand() * 3 + 1)
      } else {
        // ~15% of weekdays are zero
        if (rand() < 0.15) {
          count = 0
        } else {
          const base  = 3 + rand() * 5         // 3-8 base
          const noise = (rand() - 0.45) * 3    // ±1.5 jitter
          count = Math.max(1, Math.round(base * trend + noise))
        }
      }
    }

    total += count
    days.push({ date: iso, count, level: getContributionLevel(count) })
  }

  return { total, days }
}

// Module-level singleton — evaluated once at import time (safe under StrictMode).
export const MOCK_CONTRIBUTIONS: ContributionYear = generateContributions()

// Derived helpers for components and tooltip.

/** ISO date of the sprint peak (Tue Mar 10, 2026). */
export const SPRINT_PEAK_DATE = '2026-03-10'

/** ISO dates of the sprint week for chat citations. */
export const SPRINT_WEEK_DATES: readonly string[] = [
  '2026-03-08', '2026-03-09', '2026-03-10',
  '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14',
]
