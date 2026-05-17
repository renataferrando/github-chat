import { ProfileHeader } from '@/src/components/profile/ProfileHeader'
import { InsightsPanel } from '@/src/components/profile/InsightsPanel'
import { ProfileStats } from '@/src/components/profile/ProfileStats'
import { PinnedRepos } from '@/src/components/profile/PinnedRepos'
import { ContributionGraphShell } from '@/src/components/profile/ContributionGraph/ContributionGraphShell'
import { ChatPanel } from '@/src/components/chat/ChatPanel'
import { ChatErrorBoundary } from '@/src/components/ChatErrorBoundary'
import { ChatProvider } from '@/src/components/chat/ChatProvider'
import { MOCK_PROFILE } from '@/src/lib/mockProfile'
import { MOCK_CONTRIBUTIONS } from '@/src/lib/mockContributions'
import { MOCK_MESSAGES } from '@/src/lib/mockChat'
import { formatDateShort } from '@/src/lib/utils'
import { GitHubIcon } from '@/src/components/icons'

// ─── Subhead computation (server-side, pure) ──────────────────────────────────
function buildSubhead(): string {
  const { days } = MOCK_CONTRIBUTIONS
  if (days.length === 0) return ''

  const startLabel = formatDateShort(days[0].date)
  const endLabel = formatDateShort(days[days.length - 1].date)

  const nonZero = days.filter((d) => d.count > 0).length
  const weekdayNonZero = days.filter((d) => {
    const dow = new Date(d.date + 'T00:00:00Z').getUTCDay()
    return d.count > 0 && dow !== 0 && dow !== 6
  }).length
  const weekdayPct = nonZero > 0 ? Math.round((weekdayNonZero / nonZero) * 100) : 0

  return `${startLabel} — ${endLabel} · ${MOCK_PROFILE.stats.streak}-day streak · ${weekdayPct}% on weekdays`
}

// ─── App header (Server Component, no interactivity) ──────────────────────────
function AppHeader() {
  return (
    <header className="app-header">
      <div className="flex items-center gap-3">
        <GitHubIcon size={20} className="text-fg" />
        <span className="text-base font-mono text-fg-dim">
          elenavoss
          <span className="mx-1.5 text-fg-faint">/</span>
          <span className="text-fg font-medium">profile-chat</span>
        </span>
      </div>
    </header>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const SUBHEAD = buildSubhead()

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <AppHeader />

      {/* ChatProvider wraps everything that reads or mutates chat state */}
      <ChatProvider initialMessages={MOCK_MESSAGES}>
        <div className="page-grid flex-1">
          {/* Left: profile section */}
          <section className="profile-pane">
            <div className="profile-grid">
              <aside className="page-grid-col">
                <ProfileHeader profile={MOCK_PROFILE} />
                <ProfileStats
                  profile={MOCK_PROFILE}
                  totalContributions={MOCK_CONTRIBUTIONS.total}
                />
                <InsightsPanel
                  contributions={MOCK_CONTRIBUTIONS}
                  repos={MOCK_PROFILE.pinnedRepos}
                />
              </aside>

              <main className="page-grid-col">
                <PinnedRepos repos={MOCK_PROFILE.pinnedRepos} />

                <section className="mt-6">
                  <h2 className="text-base font-semibold text-fg">
                    {MOCK_CONTRIBUTIONS.total.toLocaleString()} contributions in the last year
                    <span className="text-sm font-normal text-fg-dim ml-2">
                      · click a cell to ask
                    </span>
                  </h2>
                  {SUBHEAD && <p className="text-sm font-mono text-fg-dim mt-1 mb-4">{SUBHEAD}</p>}
                  <div className="border border-border-muted rounded-md p-4 overflow-x-auto">
                    <ContributionGraphShell data={MOCK_CONTRIBUTIONS} />
                  </div>
                </section>
              </main>
            </div>
          </section>

          {/* Right: chat panel (reads state from ChatProvider) */}
          <ChatErrorBoundary>
            <ChatPanel />
          </ChatErrorBoundary>
        </div>
      </ChatProvider>
    </div>
  )
}
