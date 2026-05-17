import type { Profile } from '@/src/types/profile'
import { formatCount } from '@/src/lib/utils'
import { LocationIcon, StarIcon } from '@/src/components/icons'

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
          <LocationIcon size={14} className="shrink-0 text-fg-faint" />
          <span>{profile.location}</span>
        </div>
      )}

      {/* Streak + contributions */}
      <div className="flex items-center gap-2 text-base text-fg-dim">
        <StarIcon size={12} />
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
