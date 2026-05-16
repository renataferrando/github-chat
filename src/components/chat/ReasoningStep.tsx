'use client'

import { motion } from 'framer-motion'
import type { ReasoningStep, ReasoningTag } from '@/src/types/chat'

// Not exported — only used within this module.
const TAG_COLOR: Record<ReasoningTag, string> = {
  INFO: 'text-accent',
  CALC: 'text-warning',
  FIND: 'text-fg-dim',
  DONE: 'text-success',
}

const stepVariants = {
  hidden: { opacity: 0, y: 4 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
}

const stepVariantsReduced = {
  hidden: {},
  show:   {},
}

export interface ReasoningStepRowProps {
  step:         ReasoningStep
  /** True only for the last step while status === 'streaming'. */
  isLive:       boolean
  reduceMotion: boolean
  onClick?:     (sourceDates: string[]) => void
}

export function ReasoningStepRow({
  step,
  isLive,
  reduceMotion,
  onClick,
}: ReasoningStepRowProps) {
  const hasSource   = step.sourceDates.length > 0
  const isClickable = hasSource && onClick !== undefined

  return (
    <motion.div
      variants={reduceMotion ? stepVariantsReduced : stepVariants}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={
        isClickable
          ? `Highlight ${step.sourceDates.length} day${step.sourceDates.length !== 1 ? 's' : ''} on heatmap`
          : undefined
      }
      className={[
        'flex items-start gap-2 px-3 py-2 font-mono text-xs',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        isClickable ? 'cursor-pointer hover:bg-surface-2' : '',
      ].join(' ')}
      onClick={isClickable ? () => onClick(step.sourceDates) : undefined}
      onKeyDown={
        isClickable
          ? (e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick!(step.sourceDates)
              }
            }
          : undefined
      }
    >
      {/* Tag chip */}
      <span className={`flex-shrink-0 w-10 font-semibold ${TAG_COLOR[step.tag]}`}>
        {step.tag}
      </span>

      {/* Step text */}
      <span className="flex-1 text-fg leading-relaxed break-words min-w-0">
        {step.text}
        {isLive && (
          <span className="text-accent ml-1 animate-pulse" aria-hidden="true">▋</span>
        )}
      </span>

      {/* Duration */}
      <span className="flex-shrink-0 text-fg-faint whitespace-nowrap">
        {step.durationMs}ms
      </span>
    </motion.div>
  )
}
