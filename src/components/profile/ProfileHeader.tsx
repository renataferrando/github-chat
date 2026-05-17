import type { Profile } from '@/src/types/profile'
import { Avatar } from '@/src/components/ui/Avatar'
import { formatCount } from '@/src/lib/utils'
import { HeartIcon, UsersIcon } from '@/src/components/icons'

export interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div>
      <Avatar username={profile.username} name={profile.name} size={260} rounded="full" />

      <h1 className="text-xl font-semibold text-fg mt-4 leading-tight">{profile.name}</h1>
      <p className="text-lg text-fg-dim font-light">{profile.username}</p>

      <p className="text-base text-fg mt-3 leading-relaxed line-clamp-3">{profile.bio}</p>

      <div className="flex gap-2 mt-4">
        <button
          className="flex-1 h-8 bg-surface-2 border border-border rounded-md text-base font-medium text-fg hover:border-fg-faint cursor-pointer"
          type="button"
        >
          Follow
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center bg-surface-2 border border-border rounded-md text-fg-dim hover:text-danger hover:border-fg-faint cursor-pointer"
          type="button"
          aria-label="Sponsor"
        >
          <HeartIcon size={14} />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4 text-base text-fg-dim">
        <UsersIcon size={14} className="shrink-0" />
        <span>
          <strong className="text-fg font-semibold">{formatCount(profile.stats.followers)}</strong>{' '}
          followers
          {' · '}
          <strong className="text-fg font-semibold">
            {formatCount(profile.stats.following)}
          </strong>{' '}
          following
        </span>
      </div>
    </div>
  )
}
