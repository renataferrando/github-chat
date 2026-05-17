'use client'

import type { ContributionYear } from '@/src/types/contributions'
import { ContributionGraph } from './index'
import { useChat } from '@/src/components/chat/ChatProvider'

export interface ContributionGraphShellProps {
  data: ContributionYear
}

export function ContributionGraphShell({ data }: ContributionGraphShellProps) {
  const { addScope, state } = useChat()

  // Persistent outlines come from day-scope chips; transient (reasoning-step)
  // highlights come from state.highlightedCells. Union them.
  const dayScopeDates = state.scopes
    .filter((s): s is Extract<typeof s, { kind: 'day' }> => s.kind === 'day')
    .map((s) => s.date)
  const highlightedDates = new Set<string>([...dayScopeDates, ...state.highlightedCells])

  return (
    <ContributionGraph
      data={data}
      onDayClick={(day) => addScope({ kind: 'day', date: day.date })}
      highlightedDates={highlightedDates}
    />
  )
}
