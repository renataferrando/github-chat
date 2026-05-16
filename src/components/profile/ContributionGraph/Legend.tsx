// Static class names are required so Tailwind detects them at build time.
const HEAT_BG = [
  'bg-heat-0',
  'bg-heat-1',
  'bg-heat-2',
  'bg-heat-3',
  'bg-heat-4',
] as const

export function ContributionLegend() {
  return (
    <div className="flex items-center gap-2 text-sm text-fg-dim">
      <span>Less</span>
      {HEAT_BG.map((cls, level) => (
        <span
          key={level}
          className={`contrib-swatch ${cls}`}
          aria-hidden="true"
        />
      ))}
      <span>More</span>
    </div>
  )
}
