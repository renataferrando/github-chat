import { describe, it, expect, vi } from 'vitest'
import {
  seededRandom,
  avatarColor,
  formatDate,
  formatDateShort,
  formatCount,
  getContributionLevel,
  computeMonthLabels,
  trailingAverage,
} from '@/src/lib/utils'
import { AVATAR_PALETTE, AVATAR_OVERRIDES } from '@/src/lib/tokens'
import { streamReasoning } from '@/src/lib/mockChat'
import type { ContributionDay } from '@/src/types/contributions'
import type { ReasoningStep } from '@/src/types/chat'

// ─── seededRandom ──────────────────────────────────────────────────────────────

describe('seededRandom', () => {
  it('is deterministic — same seed yields same sequence', () => {
    const a = seededRandom(42)
    const b = seededRandom(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it('produces values in [0, 1)', () => {
    const rand = seededRandom(7)
    for (let i = 0; i < 100; i++) {
      const v = rand()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('different seeds yield different first values', () => {
    expect(seededRandom(1)()).not.toBe(seededRandom(2)())
  })

  it('matches known output for seed 42 (regression guard)', () => {
    const rand = seededRandom(42)
    // Snapshot the first three values so any PRNG change is immediately visible.
    const first = rand()
    const second = rand()
    const third = rand()
    expect(first).toMatchSnapshot()
    expect(second).toMatchSnapshot()
    expect(third).toMatchSnapshot()
  })
})

// ─── getContributionLevel ─────────────────────────────────────────────────────

describe('getContributionLevel', () => {
  it.each([
    [0, 0],
    [1, 1],
    [3, 1],
    [4, 2],
    [7, 2],
    [8, 3],
    [14, 3],
    [15, 4],
    [23, 4],
    [99, 4],
  ] as [number, number][])('count %i → level %i', (count, expected) => {
    expect(getContributionLevel(count)).toBe(expected)
  })
})

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('short format: day-of-week · Month day', () => {
    expect(formatDate('2026-03-10', 'short')).toBe('Tue · Mar 10')
  })

  it('long format: day-of-week, Month day, year', () => {
    expect(formatDate('2026-03-10', 'long')).toBe('Tue, March 10, 2026')
  })

  it('uses UTC so timezone does not affect the result', () => {
    // 2025-05-11 is a Sunday
    expect(formatDate('2025-05-11', 'short')).toBe('Sun · May 11')
  })

  it('handles month and day boundaries correctly', () => {
    expect(formatDate('2025-12-31', 'short')).toBe('Wed · Dec 31')
    expect(formatDate('2026-01-01', 'short')).toBe('Thu · Jan 1')
  })
})

// ─── computeMonthLabels ───────────────────────────────────────────────────────

/** Build a minimal ContributionDay array spanning given ISO dates */
function makeDays(dates: string[]): ContributionDay[] {
  return dates.map((date) => ({ date, count: 0, level: 0 as const }))
}

/** Build one day per week (Sundays) for N weeks starting at startIso */
function makeWeeklySundays(startIso: string, weeks: number): ContributionDay[] {
  const start = new Date(startIso + 'T00:00:00Z').getTime()
  const days: ContributionDay[] = []
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const ms = start + (w * 7 + d) * 86_400_000
      days.push({
        date: new Date(ms).toISOString().slice(0, 10),
        count: 0,
        level: 0,
      })
    }
  }
  return days
}

describe('computeMonthLabels', () => {
  it('returns an empty array for an empty input', () => {
    expect(computeMonthLabels([])).toEqual([])
  })

  it('labels the first week when data starts at the beginning of a month', () => {
    // 2026-01-04 is a Sunday — first full week of January 2026
    const days = makeWeeklySundays('2026-01-04', 8)
    const labels = computeMonthLabels(days)
    expect(labels[0]).toMatchObject({ label: 'Jan', weekIndex: 0 })
  })

  it('skips a month label when the gap from the previous label is < 2 weeks', () => {
    // Build a very short month span so the next month falls within 1 week
    // Use a real scenario: data starts 2025-05-11 (Sunday)
    const days = makeWeeklySundays('2025-05-11', 53)
    const labels = computeMonthLabels(days)

    // Labels should not have two consecutive entries with weekIndex diff < 2
    for (let i = 1; i < labels.length; i++) {
      expect(labels[i].weekIndex - labels[i - 1].weekIndex).toBeGreaterThanOrEqual(2)
    }
  })

  it('each weekIndex is within the valid column range', () => {
    const days = makeWeeklySundays('2025-05-11', 53)
    const labels = computeMonthLabels(days)
    const numWeeks = Math.ceil(days.length / 7)
    for (const { weekIndex } of labels) {
      expect(weekIndex).toBeGreaterThanOrEqual(0)
      expect(weekIndex).toBeLessThan(numWeeks)
    }
  })

  it('labels are distinct month strings', () => {
    const days = makeWeeklySundays('2025-05-11', 53)
    const labels = computeMonthLabels(days)
    const names = labels.map((l) => l.label)
    // No two adjacent labels should be the same month name
    for (let i = 1; i < names.length; i++) {
      expect(names[i]).not.toBe(names[i - 1])
    }
  })
})

// ─── avatarColor ──────────────────────────────────────────────────────────────

describe('avatarColor', () => {
  it('elenavoss resolves via AVATAR_OVERRIDES', () => {
    // Override currently maps elenavoss to medium blue — update if AVATAR_OVERRIDES changes.
    expect(avatarColor('elenavoss')).toBe(AVATAR_OVERRIDES['elenavoss'])
  })

  it('palette is exactly 8 colors', () => {
    expect(AVATAR_PALETTE.length).toBe(8)
  })

  it('is deterministic for the same input', () => {
    expect(avatarColor('elenavoss')).toBe(avatarColor('elenavoss'))
  })

  it('unknown username falls back to palette deterministically', () => {
    const result = avatarColor('someone-else')
    expect(AVATAR_PALETTE).toContain(result)
    expect(avatarColor('someone-else')).toBe(result)
  })
})

// ─── formatCount ──────────────────────────────────────────────────────────────

describe('formatCount', () => {
  it.each([
    [999, '999'],
    [1000, '1k'],
    [2300, '2.3k'],
    [48000, '48k'],
  ] as [number, string][])('%i → %s', (n, expected) => {
    expect(formatCount(n)).toBe(expected)
  })
})

// ─── formatDateShort ──────────────────────────────────────────────────────────

describe('formatDateShort', () => {
  it('formats as "Month Day Year"', () => {
    expect(formatDateShort('2025-05-11')).toBe('May 11 2025')
  })
})

// ─── streamReasoning ──────────────────────────────────────────────────────────

describe('streamReasoning', () => {
  it('yields each step in order respecting durationMs', async () => {
    vi.useFakeTimers()
    const steps = [
      { id: 's1', tag: 'INFO' as const, text: 'a', durationMs: 100, sourceDates: [] },
      { id: 's2', tag: 'DONE' as const, text: 'b', durationMs: 200, sourceDates: [] },
    ]
    const gen = streamReasoning(steps)
    const out: ReasoningStep[] = []
    const collect = (async () => {
      for await (const s of gen) out.push(s)
    })()
    await vi.advanceTimersByTimeAsync(100)
    expect(out).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(200)
    expect(out).toHaveLength(2)
    await collect
    vi.useRealTimers()
  })

  it('aborts mid-stream via AbortSignal', async () => {
    vi.useFakeTimers()
    const ctrl = new AbortController()
    const steps = [
      { id: 's1', tag: 'INFO' as const, text: 'a', durationMs: 100, sourceDates: [] },
      { id: 's2', tag: 'DONE' as const, text: 'b', durationMs: 999_999, sourceDates: [] },
    ]
    const gen = streamReasoning(steps, ctrl.signal)
    const out: ReasoningStep[] = []
    const collect = (async () => {
      try {
        for await (const s of gen) out.push(s)
      } catch (e) {
        expect((e as DOMException).name).toBe('AbortError')
      }
    })()
    await vi.advanceTimersByTimeAsync(100)
    expect(out).toHaveLength(1)
    ctrl.abort()
    await collect
    vi.useRealTimers()
  })
})

// ─── trailingAverage ──────────────────────────────────────────────────────────

describe('trailingAverage', () => {
  const days = makeDays(['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05']).map(
    (d, i) => ({ ...d, count: i + 1 }),
  )
  // counts: [1, 2, 3, 4, 5]

  it('returns 0 when beforeDate is not in the dataset', () => {
    expect(trailingAverage(days, '2024-12-31', 90)).toBe(0)
  })

  it('returns 0 when beforeDate is the first day (nothing before it)', () => {
    expect(trailingAverage(days, '2025-01-01', 90)).toBe(0)
  })

  it('averages all preceding days when window is larger than dataset', () => {
    // beforeDate = '2025-01-05' → preceding days are [1,2,3,4] → avg 2.5
    expect(trailingAverage(days, '2025-01-05', 90)).toBe(2.5)
  })

  it('respects the windowDays limit', () => {
    // beforeDate = '2025-01-05', window = 2 → last 2 days before: [3, 4] → avg 3.5
    expect(trailingAverage(days, '2025-01-05', 2)).toBe(3.5)
  })

  it('returns the single preceding value when only one day precedes', () => {
    // beforeDate = '2025-01-02' → preceding: [1] → avg 1
    expect(trailingAverage(days, '2025-01-02', 90)).toBe(1)
  })
})
