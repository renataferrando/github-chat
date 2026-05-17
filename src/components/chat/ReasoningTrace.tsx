'use client'

import { useState, useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ReasoningStep, StreamStatus } from '@/src/types/chat'
import { ReasoningStepRow } from './ReasoningStepRow'
import { CheckIcon, ChevronDownIcon, StopIcon } from '@/src/components/icons'

export interface ReasoningTraceProps {
  steps: ReasoningStep[]
  status: StreamStatus
  /**
   * Called when the Stop button is clicked. If omitted while
   * status === 'streaming', the Stop button is hidden.
   */
  onStop?: () => void
  /**
   * Called when a step with sourceDates is clicked. If omitted,
   * step rows render as non-interactive.
   */
  onStepClick?: (sourceDates: string[]) => void
}

// Container variant propagates staggerChildren to ReasoningStepRow children.
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}
const containerVariantsReduced = {
  hidden: {},
  show: {},
}

export function ReasoningTrace({ steps, status, onStop, onStepClick }: ReasoningTraceProps) {
  const [collapsed, setCollapsed] = useState(false)
  const prefersReduced = useReducedMotion() ?? false
  const traceId = useId()

  const isStreaming = status === 'thinking' || status === 'streaming'
  const totalMs = steps.reduce((sum, s) => sum + s.durationMs, 0)
  const totalSec = (totalMs / 1000).toFixed(1)

  const toggle = () => setCollapsed((c) => !c)

  return (
    <div
      className="border border-accent/25 rounded-md overflow-hidden mb-3"
      role="region"
      aria-label="Reasoning trace"
    >
      {/* ── Header ──
          Outer interactive element is a div[role="button"] so the Stop
          <button> can be a real <button> nested inside without invalid HTML.
      */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        aria-controls={traceId}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono bg-surface text-fg-dim hover:bg-surface-2 text-left transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            toggle()
          }
        }}
      >
        {/* Status indicator */}
        {isStreaming ? (
          <span
            className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent shrink-0 animate-spin"
            aria-label="Streaming…"
          />
        ) : (
          <span className="w-4 h-4 rounded-full bg-success flex items-center justify-center shrink-0">
            <CheckIcon size={10} className="text-bg" />
          </span>
        )}

        {/* Label */}
        <span className="flex-1 text-fg">
          {isStreaming ? 'Inspecting 365 days of activity' : 'Inspected 365 days of activity'}
          <span className="text-fg-dim ml-2">
            {isStreaming
              ? '· streaming…'
              : `· ${steps.length} step${steps.length !== 1 ? 's' : ''} · ${totalSec}s`}
            {status === 'stopped' && ' · stopped'}
          </span>
        </span>

        {/* Stop button — a real <button> child; valid because the header is a div */}
        {isStreaming && onStop && (
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-0.5 border border-border rounded-sm text-fg-dim hover:text-danger hover:border-danger transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              onStop()
            }}
          >
            <StopIcon size={8} />
            Stop
          </button>
        )}

        {/* Collapse chevron */}
        <ChevronDownIcon
          size={12}
          className={`shrink-0 transition-transform ${collapsed ? '-rotate-90' : ''}`}
        />
      </div>

      {/* ── Steps (staggered Framer Motion entry) ── */}
      {!collapsed && steps.length > 0 && (
        <motion.div
          id={traceId}
          variants={prefersReduced ? containerVariantsReduced : containerVariants}
          initial="hidden"
          animate="show"
          className="divide-y divide-border-muted"
        >
          {steps.map((step, i) => (
            <ReasoningStepRow
              key={step.id}
              step={step}
              isLive={isStreaming && i === steps.length - 1}
              reduceMotion={prefersReduced}
              onClick={onStepClick}
            />
          ))}
        </motion.div>
      )}

      {/* Empty skeleton while model is thinking (no steps yet) */}
      {!collapsed && steps.length === 0 && isStreaming && (
        <div className="px-3 py-3 text-xs font-mono text-fg-faint flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-accent border-t-transparent animate-spin shrink-0" />
          Thinking…
        </div>
      )}
    </div>
  )
}
