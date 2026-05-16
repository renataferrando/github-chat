export type Language = {
  name: string
  color: string
}

export type Repo = {
  id: string
  name: string
  description: string
  language: Language
  stars: number
  forks: number
  isFork: boolean
  url: string
}

export type ProfileStats = {
  repos: number
  followers: number
  following: number
  streak: number
}

export type Profile = {
  id: string
  name: string
  username: string
  avatarUrl: string
  bio: string
  location: string
  timezone: string
  joinedAt: string
  stats: ProfileStats
  pinnedRepos: Repo[]
}
