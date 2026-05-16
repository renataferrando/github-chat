import type { Profile } from '@/src/types/profile'
import { formatCount } from '@/src/lib/utils'

export interface ProfileStatsProps {
  profile: Profile
  totalContributions: number
}

export function ProfileStats({ profile, totalContributions }: ProfileStatsProps) {
  return (
    <div className="mt-4 flex flex-col gap-2">
      {/* Location */}
      {profile.location && (
        <div className="flex items-center gap-2 text-base text-fg-dim">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" className="flex-shrink-0 text-fg-faint">
            <path d="m12.596 11.596-3.535 3.536a1.5 1.5 0 0 1-2.122 0l-3.535-3.536a6.5 6.5 0 1 1 9.192-9.193 6.5 6.5 0 0 1 0 9.193Zm-1.06-8.132v-.001a5 5 0 1 0-7.072 7.072L8 14.07l3.536-3.534a5 5 0 0 0 0-7.072ZM8 9a2 2 0 1 1-.001-3.999A2 2 0 0 1 8 9Z" />
          </svg>
          <span>{profile.location}</span>
        </div>
      )}

      {/* Streak + contributions */}
      <div className="flex items-center gap-2 text-base text-fg-dim">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" className="flex-shrink-0 text-fg-faint">
          <path d="M9.48.11a.495.495 0 0 0-.82.13L5.91 6H.5a.5.5 0 0 0-.34.87l6.46 5.88L5.27 14a.5.5 0 0 0 .63.75L8 13.67l2.1 1.08a.5.5 0 0 0 .63-.75l-1.35-1.25 6.46-5.88A.5.5 0 0 0 15.5 6h-5.41z" />
        </svg>
        <span>
          <strong className="text-fg font-semibold">{profile.stats.streak}</strong>
          {'-day streak · '}
          <strong className="text-fg font-semibold">{formatCount(totalContributions)}</strong>
          {' contribs / yr'}
        </span>
      </div>
    </div>
  )
}
