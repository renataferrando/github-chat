import type { Message, AssistantMessage, ReasoningStep } from '@/src/types/chat'

// ─── Canned reasoning data ────────────────────────────────────────────────────
// Defined before STATIC_MESSAGES so CANNED_ASSISTANT can reference it directly.

const CANNED_REASONING: ReasoningStep[] = [
  {
    id: 'r1',
    tag: 'INFO',
    text: 'Loaded contributions[365d] from cache — 365 rows, 1,847 total events',
    durationMs: 200,
    sourceDates: [],
  },
  {
    id: 'r2',
    tag: 'FIND',
    text: 'Top day: 2026-03-10 (Tue) at 23 contributions; next highest 19 on Mar 11',
    durationMs: 350,
    sourceDates: ['2026-03-10', '2026-03-11'],
  },
  {
    id: 'r3',
    tag: 'CALC',
    text: 'Week Mar 9–15 avg: 14.4 / day vs trailing-90 baseline 5.1',
    durationMs: 580,
    sourceDates: [
      '2026-03-08', '2026-03-09', '2026-03-10',
      '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14',
    ],
  },
  {
    id: 'r4',
    tag: 'FIND',
    text: 'Commits scoped to tk-rs, branch release/0.4 · +412 lines −87',
    durationMs: 480,
    sourceDates: ['2026-03-09', '2026-03-10', '2026-03-11'],
  },
  {
    id: 'r5',
    tag: 'DONE',
    text: 'Post-sprint decay 3.8 / day → confirms release sprint. Confidence 0.94',
    durationMs: 280,
    sourceDates: ['2026-03-15', '2026-03-16', '2026-03-17'],
  },
]

const CANNED_ANSWER =
  'The busiest day was **Tuesday, March 10** — 23 contributions, almost all on the `release/0.4` branch of **tk-rs**.\n\nIt wasn\'t a one-off. The surrounding week averaged 14.4 contributions a day — about 2.8× the 90-day baseline — and activity fell sharply the following Monday. That\'s the shape of a release sprint.'

const CANNED_FOLLOWUPS = [
  'Does she ship on weekends?',
  'When did she take a break?',
  'What language did she pick up this year?',
]

/** Frozen canned data used by the streaming driver inside AssistantMessage. */
export const CANNED_ASSISTANT: {
  reasoning: AssistantMessage['reasoning']
  answer:    AssistantMessage['answer']
  followups: AssistantMessage['followups']
} = {
  reasoning: CANNED_REASONING,
  answer:    CANNED_ANSWER,
  followups: CANNED_FOLLOWUPS,
}

// ─── Static messages ──────────────────────────────────────────────────────────
// STATIC_MESSAGES[1] starts in 'thinking' with empty data so AssistantMessage
// can demonstrate the full streaming flow on load (Stage 3 driver).

export const STATIC_MESSAGES: Message[] = [
  {
    id: 'u1',
    role: 'user',
    content: "What's their busiest day, and was it a one-off or part of a longer push?",
    scopes: [{ kind: 'repo', repoId: 'tk-rs', repoName: 'tk-rs' }],
    timestamp: Date.UTC(2026, 4, 15, 14, 2, 0),
  },
  {
    id: 'a1',
    role: 'assistant',
    status: 'thinking',
    reasoning: [],
    answer:    '',
    followups: [],
    timestamp: Date.UTC(2026, 4, 15, 14, 2, 3),
  },
]

// ─── Streaming generator ──────────────────────────────────────────────────────

/**
 * Async generator that yields steps one at a time, respecting each step's
 * `durationMs`. Aborts cleanly when `signal` fires.
 */
export async function* streamReasoning(
  steps: ReasoningStep[],
  signal?: AbortSignal,
): AsyncGenerator<ReasoningStep, void, void> {
  for (const step of steps) {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(resolve, step.durationMs)
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timer)
          reject(new DOMException('aborted', 'AbortError'))
        }, { once: true })
      }
    })
    yield step
  }
}
