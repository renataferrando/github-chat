// ─── Scope ───────────────────────────────────────────────────────────────────

export type ChatScope =
  | { kind: 'day'; date: string }
  | { kind: 'repo'; repoId: string; repoName: string }
  | { kind: 'window'; from: string; to: string }

export type ChatScopeKind = ChatScope['kind']

// ─── Reasoning ───────────────────────────────────────────────────────────────

export type ReasoningTag = 'INFO' | 'CALC' | 'FIND' | 'DONE'

export type ReasoningStep = {
  id: string
  tag: ReasoningTag
  text: string
  durationMs: number
  /** ISO date strings this step references — used to highlight heatmap cells */
  sourceDates: string[]
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export type UserMessage = {
  id: string
  role: 'user'
  content: string
  scopes: ChatScope[]
  timestamp: number
}

export type StreamStatus = 'thinking' | 'streaming' | 'done' | 'stopped' | 'error'

export type Figure = {
  label: string
  value: string
  sub?: string
  tone?: 'success' | 'warning' | 'fg'
}

export type AssistantMessage = {
  id: string
  role: 'assistant'
  status: StreamStatus
  reasoning: ReasoningStep[]
  answer: string
  followups: string[]
  figures?: Figure[]
  timestamp: number
}

export type Message = UserMessage | AssistantMessage

// ─── Context / Reducer ───────────────────────────────────────────────────────

export type ChatState = {
  messages: Message[]
  status: 'idle' | 'streaming'
  scopes: ChatScope[]
  /** ISO date strings currently highlighted in the heatmap */
  highlightedCells: string[]
}

export type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: UserMessage }
  | { type: 'BEGIN_RESPONSE'; payload: { id: string } }
  | { type: 'REASONING_STEP'; payload: { msgId: string; step: ReasoningStep } }
  | { type: 'ANSWER_CHUNK'; payload: { msgId: string; chunk: string } }
  // FINISH now carries the complete answer so Stage 4 can set it in one shot.
  | {
      type: 'FINISH'
      payload: { msgId: string; answer: string; followups: string[]; figures?: Figure[] }
    }
  | { type: 'STOP'; payload: { msgId: string } }
  | { type: 'ERROR'; payload: { msgId: string; error: string } }
  | { type: 'ADD_SCOPE'; payload: ChatScope }
  // REMOVE_SCOPE accepts the full scope object — the reducer matches by kind + discriminating field.
  | { type: 'REMOVE_SCOPE'; payload: ChatScope }
  | { type: 'CLEAR_SCOPES' }
  | { type: 'SET_HIGHLIGHTED'; payload: string[] }

export type ChatContextValue = {
  state: ChatState
  sendMessage: (text: string) => void
  stopStreaming: (msgId?: string) => void
  addScope: (scope: ChatScope) => void
  // Changed from (kind, id) => void to (scope: ChatScope) => void for type safety.
  // Day scopes have no stable "id"; using the full scope avoids ambiguity.
  removeScope: (scope: ChatScope) => void
  clearScopes: () => void
  setHighlightedCells: (dates: string[]) => void
}
