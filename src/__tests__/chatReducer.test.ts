import { describe, it, expect } from 'vitest'
import { initialChatState, chatReducer } from '@/src/lib/chatReducer'
import type { Message, UserMessage, AssistantMessage, ChatScope } from '@/src/types/chat'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const USER_MSG: UserMessage = {
  id: 'u1', role: 'user', content: 'hello',
  scopes: [], timestamp: 1000,
}

const THINKING_MSG: AssistantMessage = {
  id: 'a1', role: 'assistant', status: 'thinking',
  reasoning: [], answer: '', followups: [], timestamp: 1001,
}

const SEED: Message[] = [USER_MSG, THINKING_MSG]

const STEP = {
  id: 'r1', tag: 'INFO' as const, text: 'loaded', durationMs: 100, sourceDates: [],
}

// ─── initialChatState ─────────────────────────────────────────────────────────

describe('initialChatState', () => {
  it('seeds messages and zeroes everything else', () => {
    const s = initialChatState(SEED)
    expect(s.messages).toBe(SEED)
    expect(s.status).toBe('idle')
    expect(s.scopes).toEqual([])
    expect(s.highlightedCells).toEqual([])
  })
})

// ─── SEND_MESSAGE ─────────────────────────────────────────────────────────────

describe('SEND_MESSAGE', () => {
  it('appends user msg and a new thinking assistant msg', () => {
    const s0 = initialChatState([])
    const s1 = chatReducer(s0, { type: 'SEND_MESSAGE', payload: USER_MSG })
    expect(s1.messages).toHaveLength(2)
    expect(s1.messages[0]).toBe(USER_MSG)
    expect(s1.messages[1]).toMatchObject({ role: 'assistant', status: 'thinking', reasoning: [], answer: '' })
  })

  it('attaches current scopes to user msg and clears bar', () => {
    const scope: ChatScope = { kind: 'repo', repoId: 'tk', repoName: 'tk-rs' }
    const s0: ReturnType<typeof initialChatState> = { ...initialChatState([]), scopes: [scope] }
    // Simulate scopes already being on the user message (provider does this)
    const userWithScope: UserMessage = { ...USER_MSG, scopes: [scope] }
    const s1 = chatReducer(s0, { type: 'SEND_MESSAGE', payload: userWithScope })
    expect(s1.messages[0]).toMatchObject({ scopes: [scope] })
    expect(s1.scopes).toEqual([])
  })

  it('sets status to streaming', () => {
    const s0 = initialChatState([])
    const s1 = chatReducer(s0, { type: 'SEND_MESSAGE', payload: USER_MSG })
    expect(s1.status).toBe('streaming')
  })
})

// ─── BEGIN_RESPONSE ───────────────────────────────────────────────────────────

describe('BEGIN_RESPONSE', () => {
  it('sets the target assistant msg to streaming', () => {
    const s0 = initialChatState(SEED)
    const s1 = chatReducer(s0, { type: 'BEGIN_RESPONSE', payload: { id: 'a1' } })
    const msg = s1.messages.find(m => m.id === 'a1') as AssistantMessage
    expect(msg.status).toBe('streaming')
  })

  it('leaves other messages unchanged', () => {
    const s0 = initialChatState(SEED)
    const s1 = chatReducer(s0, { type: 'BEGIN_RESPONSE', payload: { id: 'a1' } })
    expect(s1.messages.find(m => m.id === 'u1')).toBe(USER_MSG)
  })
})

// ─── REASONING_STEP ───────────────────────────────────────────────────────────

describe('REASONING_STEP', () => {
  it('appends step to the target msg reasoning array', () => {
    const s0 = initialChatState(SEED)
    const s1 = chatReducer(s0, { type: 'REASONING_STEP', payload: { msgId: 'a1', step: STEP } })
    const msg = s1.messages.find(m => m.id === 'a1') as AssistantMessage
    expect(msg.reasoning).toHaveLength(1)
    expect(msg.reasoning[0]).toBe(STEP)
  })
})

// ─── ANSWER_CHUNK ─────────────────────────────────────────────────────────────

describe('ANSWER_CHUNK', () => {
  it('appends chunk to answer (streaming use-case)', () => {
    const s0 = initialChatState(SEED)
    const s1 = chatReducer(s0, { type: 'ANSWER_CHUNK', payload: { msgId: 'a1', chunk: 'Hello' } })
    const s2 = chatReducer(s1, { type: 'ANSWER_CHUNK', payload: { msgId: 'a1', chunk: ' world' } })
    const msg = s2.messages.find(m => m.id === 'a1') as AssistantMessage
    expect(msg.answer).toBe('Hello world')
  })
})

// ─── FINISH ───────────────────────────────────────────────────────────────────

describe('FINISH', () => {
  it('sets status done, answer, followups on the target msg', () => {
    const s0 = initialChatState(SEED)
    const s1 = chatReducer(s0, {
      type: 'FINISH',
      payload: { msgId: 'a1', answer: 'The answer.', followups: ['Q1', 'Q2'] },
    })
    const msg = s1.messages.find(m => m.id === 'a1') as AssistantMessage
    expect(msg.status).toBe('done')
    expect(msg.answer).toBe('The answer.')
    expect(msg.followups).toEqual(['Q1', 'Q2'])
  })

  it('flips state.status to idle', () => {
    const s0: ReturnType<typeof initialChatState> = { ...initialChatState(SEED), status: 'streaming' }
    const s1 = chatReducer(s0, { type: 'FINISH', payload: { msgId: 'a1', answer: '', followups: [] } })
    expect(s1.status).toBe('idle')
  })
})

// ─── STOP ─────────────────────────────────────────────────────────────────────

describe('STOP', () => {
  it('transitions the target msg to stopped and state to idle', () => {
    const s0: ReturnType<typeof initialChatState> = { ...initialChatState(SEED), status: 'streaming' }
    const s1 = chatReducer(s0, { type: 'STOP', payload: { msgId: 'a1' } })
    const msg = s1.messages.find(m => m.id === 'a1') as AssistantMessage
    expect(msg.status).toBe('stopped')
    expect(s1.status).toBe('idle')
  })
})

// ─── ERROR ────────────────────────────────────────────────────────────────────

describe('ERROR', () => {
  it('sets error status and prefixes answer', () => {
    const s0 = initialChatState(SEED)
    const s1 = chatReducer(s0, { type: 'ERROR', payload: { msgId: 'a1', error: 'timeout' } })
    const msg = s1.messages.find(m => m.id === 'a1') as AssistantMessage
    expect(msg.status).toBe('error')
    expect(msg.answer).toBe('[error] timeout')
    expect(s1.status).toBe('idle')
  })
})

// ─── ADD_SCOPE ────────────────────────────────────────────────────────────────

describe('ADD_SCOPE', () => {
  const dayScope: ChatScope = { kind: 'day', date: '2026-03-10' }
  const repoScope: ChatScope = { kind: 'repo', repoId: 'tk', repoName: 'tk-rs' }

  it('appends a new scope', () => {
    const s0 = initialChatState([])
    const s1 = chatReducer(s0, { type: 'ADD_SCOPE', payload: dayScope })
    expect(s1.scopes).toHaveLength(1)
    expect(s1.scopes[0]).toEqual(dayScope)
  })

  it('deduplicates day scopes by date', () => {
    const s0 = initialChatState([])
    const s1 = chatReducer(s0, { type: 'ADD_SCOPE', payload: dayScope })
    const s2 = chatReducer(s1, { type: 'ADD_SCOPE', payload: { kind: 'day', date: '2026-03-10' } })
    expect(s2.scopes).toHaveLength(1)
  })

  it('deduplicates repo scopes by repoId', () => {
    const s0 = initialChatState([])
    const s1 = chatReducer(s0, { type: 'ADD_SCOPE', payload: repoScope })
    const s2 = chatReducer(s1, { type: 'ADD_SCOPE', payload: { kind: 'repo', repoId: 'tk', repoName: 'tk-rs' } })
    expect(s2.scopes).toHaveLength(1)
  })

  it('allows scopes of different kinds', () => {
    const s0 = initialChatState([])
    const s1 = chatReducer(s0, { type: 'ADD_SCOPE', payload: dayScope })
    const s2 = chatReducer(s1, { type: 'ADD_SCOPE', payload: repoScope })
    expect(s2.scopes).toHaveLength(2)
  })
})

// ─── REMOVE_SCOPE ─────────────────────────────────────────────────────────────

describe('REMOVE_SCOPE', () => {
  const dayScope: ChatScope  = { kind: 'day',  date: '2026-03-10' }
  const repoScope: ChatScope = { kind: 'repo', repoId: 'tk', repoName: 'tk-rs' }

  it('removes a day scope by date', () => {
    let s = initialChatState([])
    s = chatReducer(s, { type: 'ADD_SCOPE', payload: dayScope })
    s = chatReducer(s, { type: 'ADD_SCOPE', payload: repoScope })
    s = chatReducer(s, { type: 'REMOVE_SCOPE', payload: dayScope })
    expect(s.scopes).toHaveLength(1)
    expect(s.scopes[0].kind).toBe('repo')
  })

  it('removes a repo scope by repoId', () => {
    let s = initialChatState([])
    s = chatReducer(s, { type: 'ADD_SCOPE', payload: dayScope })
    s = chatReducer(s, { type: 'ADD_SCOPE', payload: repoScope })
    s = chatReducer(s, { type: 'REMOVE_SCOPE', payload: repoScope })
    expect(s.scopes).toHaveLength(1)
    expect(s.scopes[0].kind).toBe('day')
  })

  it('is a no-op when the scope is not present', () => {
    const s0 = initialChatState([])
    const s1 = chatReducer(s0, { type: 'REMOVE_SCOPE', payload: dayScope })
    expect(s1.scopes).toHaveLength(0)
  })
})

// ─── SET_HIGHLIGHTED ──────────────────────────────────────────────────────────

describe('SET_HIGHLIGHTED', () => {
  it('replaces highlightedCells entirely (not appends)', () => {
    let s = initialChatState([])
    s = chatReducer(s, { type: 'SET_HIGHLIGHTED', payload: ['2026-03-10'] })
    s = chatReducer(s, { type: 'SET_HIGHLIGHTED', payload: ['2026-03-11', '2026-03-12'] })
    expect(s.highlightedCells).toEqual(['2026-03-11', '2026-03-12'])
  })

  it('accepts an empty array (clear)', () => {
    let s = initialChatState([])
    s = chatReducer(s, { type: 'SET_HIGHLIGHTED', payload: ['2026-03-10'] })
    s = chatReducer(s, { type: 'SET_HIGHLIGHTED', payload: [] })
    expect(s.highlightedCells).toHaveLength(0)
  })
})

// ─── default case ─────────────────────────────────────────────────────────────

describe('default', () => {
  it('returns state unchanged for unknown action', () => {
    const s0 = initialChatState(SEED)
    // Cast to trigger the default branch
    const s1 = chatReducer(s0, { type: 'UNKNOWN' } as never)
    expect(s1).toBe(s0)
  })
})
