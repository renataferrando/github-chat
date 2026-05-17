import type { Figure } from '@/src/types/chat'

export interface FiguresCardProps {
  figures: Figure[]
}

function toneClass(tone?: Figure['tone']): string {
  if (tone === 'success') return 'text-success'
  if (tone === 'warning') return 'text-warning'
  return 'text-fg'
}

export function FiguresCard({ figures }: FiguresCardProps) {
  return (
    <div
      role="group"
      aria-label="Figures"
      className="border border-accent/25 rounded-md p-3 mb-3 bg-surface flex gap-3"
    >
      {figures.map((f) => (
        <div key={f.label} className="flex-1 min-w-0">
          <div className="text-xs font-mono text-fg-faint">{f.label}</div>
          <div className={`text-xl font-semibold ${toneClass(f.tone)} mt-1 truncate`}>
            {f.value}
          </div>
          {f.sub && <div className="text-xs text-fg-dim mt-0.5 truncate">{f.sub}</div>}
        </div>
      ))}
    </div>
  )
}
