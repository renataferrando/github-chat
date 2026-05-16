export type HeatLevel = 0 | 1 | 2 | 3 | 4

export type ContributionDay = {
  /** ISO 8601 date string, e.g. "2025-05-11" */
  date: string
  count: number
  level: HeatLevel
}

export type ContributionYear = {
  total: number
  days: ContributionDay[]
}
