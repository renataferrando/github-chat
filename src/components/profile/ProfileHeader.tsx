import type { Profile } from "@/src/types/profile";
import { Avatar } from "@/src/components/ui/Avatar";
import { formatCount } from "@/src/lib/utils";

export interface ProfileHeaderProps {
  profile: Profile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div>
      {/* Avatar */}
      <Avatar
        username={profile.username}
        name={profile.name}
        size={260}
        rounded="md"
      />

      {/* Name + handle */}
      <h1 className="text-xl font-semibold text-fg mt-4 leading-tight">
        {profile.name}
      </h1>
      <p className="text-lg text-fg-dim font-light">{profile.username}</p>

      {/* Bio */}
      <p className="text-base text-fg mt-3 leading-relaxed line-clamp-3">
        {profile.bio}
      </p>

      {/* Follow row */}
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
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
            <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002Z" />
          </svg>
        </button>
      </div>

      {/* Followers / following */}
      <div className="flex items-center gap-2 mt-4 text-base text-fg-dim">
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="currentColor"
          className="flex-shrink-0"
        >
          <path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a.75.75 0 1 0 0 1.5 1.5 1.5 0 0 1 .666 2.844.75.75 0 0 0-.416 1.014 5.516 5.516 0 0 1 2.244 3.791.75.75 0 1 0 1.48-.218A7.01 7.01 0 0 0 13.29 8.44 3 3 0 0 0 11 4Z" />
        </svg>
        <span>
          <strong className="text-fg font-semibold">
            {formatCount(profile.stats.followers)}
          </strong>{" "}
          followers
          {" · "}
          <strong className="text-fg font-semibold">
            {formatCount(profile.stats.following)}
          </strong>{" "}
          following
        </span>
      </div>
    </div>
  );
}
