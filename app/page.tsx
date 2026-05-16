import { ProfileHeader } from "@/src/components/profile/ProfileHeader";
import { ProfileStats } from "@/src/components/profile/ProfileStats";
import { PinnedRepos } from "@/src/components/profile/PinnedRepos";
import { ContributionGraphShell } from "@/src/components/profile/ContributionGraph/ContributionGraphShell";
import { ChatPanel } from "@/src/components/chat/ChatPanel";
import { ChatProvider } from "@/src/components/chat/ChatProvider";
import { MOCK_PROFILE } from "@/src/lib/mockProfile";
import { MOCK_CONTRIBUTIONS } from "@/src/lib/mockContributions";
import { STATIC_MESSAGES } from "@/src/lib/mockChat";
import { formatDateShort } from "@/src/lib/utils";

// ─── Subhead computation (server-side, pure) ──────────────────────────────────
function buildSubhead(): string {
  const { days } = MOCK_CONTRIBUTIONS;
  if (days.length === 0) return "";

  const startLabel = formatDateShort(days[0].date);
  const endLabel = formatDateShort(days[days.length - 1].date);

  const nonZero = days.filter((d) => d.count > 0).length;
  const weekdayNonZero = days.filter((d) => {
    const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
    return d.count > 0 && dow !== 0 && dow !== 6;
  }).length;
  const weekdayPct =
    nonZero > 0 ? Math.round((weekdayNonZero / nonZero) * 100) : 0;

  return `${startLabel} — ${endLabel} · ${MOCK_PROFILE.stats.streak}-day streak · ${weekdayPct}% on weekdays`;
}

// ─── App header (Server Component, no interactivity) ──────────────────────────
function AppHeader() {
  return (
    <header className="app-header">
      <div className="flex items-center gap-3">
        <svg
          viewBox="0 0 16 16"
          width="20"
          height="20"
          fill="currentColor"
          className="text-fg"
          aria-hidden="true"
        >
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
        </svg>
        <span className="text-base font-mono text-fg-dim">
          elenavoss
          <span className="mx-1.5 text-fg-faint">/</span>
          <span className="text-fg font-medium">profile-chat</span>
        </span>
      </div>
    </header>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const SUBHEAD = buildSubhead();

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <AppHeader />

      {/* ChatProvider wraps everything that reads or mutates chat state */}
      <ChatProvider initialMessages={STATIC_MESSAGES}>
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
              </aside>

              <main className="page-grid-col">
                <PinnedRepos repos={MOCK_PROFILE.pinnedRepos} />

                <section className="mt-6">
                  <h2 className="text-base font-semibold text-fg">
                    {MOCK_CONTRIBUTIONS.total.toLocaleString()} contributions in
                    the last year
                    <span className="text-sm font-normal text-fg-dim ml-2">
                      · click a cell to ask
                    </span>
                  </h2>
                  {SUBHEAD && (
                    <p className="text-sm font-mono text-fg-dim mt-1 mb-4">
                      {SUBHEAD}
                    </p>
                  )}
                  <div className="border border-border-muted rounded-md p-4 overflow-x-auto">
                    <ContributionGraphShell data={MOCK_CONTRIBUTIONS} />
                  </div>
                </section>
              </main>
            </div>
          </section>

          {/* Right: chat panel (reads state from ChatProvider) */}
          <ChatPanel />
        </div>
      </ChatProvider>
    </div>
  );
}
