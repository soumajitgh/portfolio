import { ArrowLeft, ExternalLink, Trophy } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import {
  ContributionChart,
  DifficultyChart,
  LanguageChart,
} from '@/components/stats/stats-charts'
import {
  Rank,
  StatValue,
  StatsPanel,
  StatsUnavailable,
} from '@/components/stats/stats-ui'
import { getLeetCodeStats } from '@/lib/stats-data'

export const metadata: Metadata = {
  alternates: { canonical: '/stats/leetcode' },
  description:
    'Detailed LeetCode problem-solving, contest, language, and submission statistics for Soumajit Ghosh.',
  title: 'LeetCode Stats',
}

export const revalidate = 900

export default async function LeetCodeStatsPage() {
  const stats = await getLeetCodeStats()

  return (
    <main className="page-container py-10 sm:py-12 md:py-16">
      <Link
        className="inline-flex min-h-11 items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary"
        href="/stats"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        ../stats
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-xs text-terminal-green">leetcode / @{stats.username}</p>
          <h1 className="detail-title mt-3 font-semibold">Problem-solving profile</h1>
          <p className="detail-lede mt-3 max-w-2xl text-muted-foreground">
            Difficulty distribution, language depth, contest performance, and recent accepted work.
          </p>
        </div>
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 font-mono text-xs text-primary transition-colors hover:border-primary/60 hover:bg-accent"
          href={`https://leetcode.com/u/${encodeURIComponent(stats.username)}/`}
          rel="noreferrer"
          target="_blank"
        >
          view profile
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </div>

      {!stats.available ? (
        <StatsUnavailable detail={stats.error} label="LeetCode stats" />
      ) : (
        <>
          <div className="mt-9 grid grid-cols-2 gap-4 rounded-lg border border-border bg-card/45 p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-6">
            <StatValue label="solved" tone="green" value={stats.solved.total} />
            <StatValue label="profile rank" value={<Rank value={stats.profileRanking} />} />
            <StatValue
              label="contest rating"
              tone="yellow"
              value={stats.contest.rating ? Math.round(stats.contest.rating) : '—'}
            />
            <StatValue
              label="contest rank"
              tone="purple"
              value={<Rank value={stats.contest.globalRanking} />}
            />
            <StatValue
              label="top percentage"
              tone="cyan"
              value={stats.contest.topPercentage ? `${stats.contest.topPercentage}%` : '—'}
            />
            <StatValue label="reputation" value={stats.reputation || '—'} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <StatsPanel eyebrow="coverage" title="Difficulty breakdown">
              <DifficultyChart
                easy={stats.solved.easy}
                hard={stats.solved.hard}
                medium={stats.solved.medium}
              />
              <div className="grid grid-cols-3 gap-3 border-t border-border/70 pt-4 text-center font-mono text-[0.6875rem] text-muted-foreground">
                <span>{stats.totalQuestions.easy || '—'} easy total</span>
                <span>{stats.totalQuestions.medium || '—'} medium total</span>
                <span>{stats.totalQuestions.hard || '—'} hard total</span>
              </div>
            </StatsPanel>

            <StatsPanel eyebrow="toolbox" title="Languages">
              {stats.languages.length ? (
                <LanguageChart
                  items={stats.languages.map((item) => ({
                    name: item.name,
                    value: item.solved,
                  }))}
                  valueLabel="problems"
                />
              ) : (
                <StatsUnavailable label="Language stats" />
              )}
            </StatsPanel>

            {stats.calendar.length ? (
              <StatsPanel className="lg:col-span-2" eyebrow="consistency" title="Submission activity">
                <ContributionChart days={stats.calendar} noun="submissions" />
              </StatsPanel>
            ) : null}

            <StatsPanel className="lg:col-span-2" eyebrow="accepted" title="Recent solutions">
              {stats.recentSubmissions.length ? (
                <div className="mt-5 divide-y divide-border/70">
                  {stats.recentSubmissions.map((submission, index) => (
                    <a
                      className="group grid min-h-14 items-center gap-2 py-3 sm:grid-cols-[2rem_minmax(0,1fr)_8rem] sm:gap-4"
                      href={`https://leetcode.com/problems/${submission.titleSlug}/`}
                      key={`${submission.titleSlug}-${submission.timestamp}-${index}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="hidden font-mono text-[0.6875rem] text-muted-foreground sm:block">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate font-mono text-xs text-foreground group-hover:text-primary">
                        {submission.title}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[0.6875rem] text-terminal-green sm:justify-end">
                        <Trophy aria-hidden="true" className="size-3" />
                        {submission.language || 'accepted'}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <StatsUnavailable label="Recent submissions" />
              )}
            </StatsPanel>
          </div>
        </>
      )}
    </main>
  )
}
