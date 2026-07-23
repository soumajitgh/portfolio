import { Clock3, Code2, GitCommitHorizontal, Radio } from 'lucide-react'
import type { Metadata } from 'next'

import {
  AIUsageCharts,
  DifficultyChart,
  WakaTimeCharts,
} from '@/components/stats/stats-charts'
import {
  ContributionDots,
  StatValue,
  StatsPanel,
  StatsUnavailable,
} from '@/components/stats/stats-ui'
import { getGitHubStats, getLeetCodeStats, getWakaTimeStats } from '@/lib/stats-data'

export const metadata: Metadata = {
  alternates: { canonical: '/stats' },
  description:
    'Live coding, open-source, problem-solving, and development activity statistics for fullstack developer Soumajit Ghosh.',
  openGraph: {
    description:
      'Live coding, open-source, problem-solving, and development activity statistics for fullstack developer Soumajit Ghosh.',
    title: 'Developer Stats',
    type: 'website',
    url: '/stats',
  },
  title: 'Developer Stats',
  twitter: {
    card: 'summary_large_image',
    description: 'Live development activity and coding statistics for Soumajit Ghosh.',
    title: 'Developer Stats',
  },
}

export const revalidate = 900

const compactNumber = (value: number) =>
  new Intl.NumberFormat('en', { maximumFractionDigits: 1, notation: 'compact' }).format(value)

export default async function StatsPage() {
  const [leetcode, github, wakatime] = await Promise.all([
    getLeetCodeStats(),
    getGitHubStats(),
    getWakaTimeStats(),
  ])
  const primaryProject =
    [...wakatime.daily].reverse().find((day) => day.projects.length)?.projects[0] ||
    wakatime.projects[0]

  return (
    <main className="page-container py-10 sm:py-12 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-xs text-terminal-green sm:text-sm">
            soumajit@portfolio:<span className="text-terminal-blue">~</span>$ watch ./stats
          </p>
          <h1 className="page-title mt-4 font-semibold">Developer telemetry</h1>
          <p className="page-lede mt-3 max-w-2xl text-muted-foreground">
            A live view of problems solved, open-source activity, and time invested in building
            software.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5 font-mono text-[0.6875rem] text-muted-foreground">
          <Radio aria-hidden="true" className="size-3 text-terminal-green" />
          cached for 15 min
        </div>
      </div>

      <div className="mt-9 grid items-start gap-5 lg:grid-cols-2">
        <StatsPanel eyebrow="problem solving" href="/stats/leetcode" title="LeetCode">
          {leetcode.available ? (
            <>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <StatValue label="problems solved" tone="green" value={leetcode.solved.total} />
                <StatValue
                  label="contest rating"
                  tone="yellow"
                  value={leetcode.contest.rating ? Math.round(leetcode.contest.rating) : '—'}
                />
                <StatValue
                  label="contests"
                  tone="purple"
                  value={leetcode.contest.attended || '—'}
                />
              </div>
              <div className="mt-4 border-t border-border/70 pt-2">
                <DifficultyChart
                  easy={leetcode.solved.easy}
                  hard={leetcode.solved.hard}
                  medium={leetcode.solved.medium}
                />
              </div>
            </>
          ) : (
            <StatsUnavailable detail={leetcode.error} label="LeetCode stats" />
          )}
        </StatsPanel>

        <StatsPanel eyebrow="open source" href="/stats/github" title="GitHub">
          {github.available ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatValue label="public repos" value={github.publicRepos} />
                <StatValue label="total stars" tone="yellow" value={github.totalStars} />
                <StatValue label="followers" tone="purple" value={github.followers} />
                <StatValue label="total forks" tone="cyan" value={github.totalForks} />
              </div>
              <ContributionDots days={github.contributionDays} />
            </>
          ) : (
            <StatsUnavailable detail={github.error} label="GitHub stats" />
          )}
        </StatsPanel>

        <StatsPanel
          className="lg:col-span-2"
          eyebrow="coding activity"
          title="WakaTime"
        >
          {wakatime.available ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                <StatValue
                  label="this week"
                  tone="green"
                  value={wakatime.totalThisWeek}
                />
                <StatValue label="daily average" value={wakatime.dailyAverage} />
                <StatValue
                  label="active project"
                  tone="purple"
                  value={
                    <span className="block max-w-full truncate text-base sm:text-lg">
                      {primaryProject?.name || '—'}
                    </span>
                  }
                />
                <StatValue
                  label="all-time activity"
                  tone="yellow"
                  value={wakatime.totalAllTime}
                />
              </div>
              <div className="mt-7">
                <WakaTimeCharts
                  daily={wakatime.daily}
                  editors={wakatime.editors}
                  languages={wakatime.languages}
                  projects={wakatime.projects}
                />
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.6875rem] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 aria-hidden="true" className="size-3 text-terminal-blue" />
                  {wakatime.range}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Code2 aria-hidden="true" className="size-3 text-terminal-green" />
                  {wakatime.languages[0]?.name || 'No language data'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GitCommitHorizontal
                    aria-hidden="true"
                    className="size-3 text-terminal-purple"
                  />
                  editor: {wakatime.editors[0]?.name || 'unknown'}
                </span>
              </div>
            </>
          ) : (
            <StatsUnavailable
              detail={
                wakatime.error === 'WAKATIME_API_KEY is not configured'
                  ? 'Add WAKATIME_API_KEY to the server environment to enable private coding metrics.'
                  : wakatime.error
              }
              label="WakaTime stats"
            />
          )}
        </StatsPanel>

        <StatsPanel
          className="lg:col-span-2"
          eyebrow="assisted engineering"
          title="AI usage"
        >
          {wakatime.available && wakatime.ai.available ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <StatValue
                  label="AI line changes"
                  tone="purple"
                  value={compactNumber(wakatime.ai.lineChanges)}
                />
                <StatValue
                  label="AI adoption"
                  tone="green"
                  value={`${wakatime.ai.adoptionPercent.toFixed(1)}%`}
                />
                <StatValue
                  label="prompt events"
                  value={compactNumber(wakatime.ai.promptEvents)}
                />
                <StatValue
                  label="AI sessions"
                  tone="cyan"
                  value={compactNumber(wakatime.ai.sessions)}
                />
                <StatValue
                  label="prompts / session"
                  tone="yellow"
                  value={wakatime.ai.promptsPerSession.toFixed(1)}
                />
                <StatValue
                  label="estimated cost"
                  tone="yellow"
                  value={`$${wakatime.ai.totalCost.toFixed(2)}`}
                />
              </div>
              <div className="mt-7">
                <AIUsageCharts usage={wakatime.ai} />
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.6875rem] text-muted-foreground">
                <span>{compactNumber(wakatime.ai.additions)} AI additions</span>
                <span>{compactNumber(wakatime.ai.deletions)} AI deletions</span>
                <span>{compactNumber(wakatime.ai.promptCharacters)} prompt characters</span>
                <span>{wakatime.ai.aiCodingTime} in AI coding mode</span>
              </div>
            </>
          ) : (
            <StatsUnavailable
              detail={
                wakatime.available
                  ? 'WakaTime did not report AI agent activity for this range. Enable WakaTime in your AI coding tools to populate line, prompt, session, and cost metrics.'
                  : wakatime.error === 'WAKATIME_API_KEY is not configured'
                    ? 'Add WAKATIME_API_KEY to the server environment to load AI usage metrics.'
                    : wakatime.error
              }
              label="AI usage metrics"
            />
          )}
        </StatsPanel>
      </div>
    </main>
  )
}
