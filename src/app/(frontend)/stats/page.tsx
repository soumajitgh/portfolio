import { Clock3, Code2, GitCommitHorizontal, Radio } from 'lucide-react'
import type { Metadata } from 'next'

import { DifficultyChart, WakaTimeCharts } from '@/components/stats/stats-charts'
import {
  Rank,
  StatValue,
  StatsPanel,
  StatsUnavailable,
} from '@/components/stats/stats-ui'
import { getGitHubStats, getLeetCodeStats, getWakaTimeStats } from '@/lib/stats-data'

export const metadata: Metadata = {
  alternates: { canonical: '/stats' },
  description:
    'Live coding, open-source, problem-solving, and development activity statistics for Soumajit Ghosh.',
  title: 'Developer Stats',
}

export const revalidate = 900

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

      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        <StatsPanel eyebrow="problem solving" href="/stats/leetcode" title="LeetCode">
          {leetcode.available ? (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatValue label="problems solved" tone="green" value={leetcode.solved.total} />
                <StatValue label="global rank" value={<Rank value={leetcode.profileRanking} />} />
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
              <div className="mt-7">
                <p className="font-mono text-xs text-muted-foreground">recent repositories</p>
                <div className="mt-3 space-y-2">
                  {github.recentRepositories.slice(0, 4).map((repo) => (
                    <a
                      className="group flex min-h-11 items-center justify-between gap-3 rounded-md border border-border/70 bg-background/25 px-3 py-2 transition-colors hover:border-primary/50"
                      href={repo.url}
                      key={repo.name}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-xs text-foreground group-hover:text-primary">
                          {repo.name}
                        </span>
                        <span className="block text-[0.6875rem] text-muted-foreground">
                          {repo.language || 'repository'}
                        </span>
                      </span>
                      <span className="shrink-0 font-mono text-[0.6875rem] text-terminal-yellow">
                        ★ {repo.stars}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
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
      </div>
    </main>
  )
}
