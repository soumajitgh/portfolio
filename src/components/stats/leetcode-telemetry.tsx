import { ExternalLink } from 'lucide-react'

import type { LeetCodeStats } from '@/lib/stats-data'

import { ContributionChart, DifficultyChart, LanguageChart } from './stats-charts'
import { formatDate, Rank, StatValue, StatsPanel, StatsSection, StatsUnavailable } from './stats-ui'

export function LeetCodeTelemetry({ stats }: { stats: LeetCodeStats }) {
  return (
    <StatsSection
      id="leetcode"
      profileURL={`https://leetcode.com/u/${encodeURIComponent(stats.username)}/`}
      title="LeetCode"
      username={stats.username}
    >
      {!stats.available ? (
        <StatsUnavailable detail={stats.error} label="LeetCode stats" />
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg border border-border bg-card/45 p-4 sm:grid-cols-3 sm:p-6">
            <StatValue label="problems solved" tone="green" value={stats.solved.total} />
            <StatValue label="profile rank" value={<Rank value={stats.profileRanking} />} />
            <StatValue label="reputation" value={stats.reputation || '—'} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <StatsPanel title="Difficulty breakdown">
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

            <StatsPanel title="Languages">
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

            <StatsPanel className="lg:col-span-2" title="Contest performance">
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatValue label="contests attended" value={stats.contest.attended || '—'} />
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
              </div>
            </StatsPanel>

            <StatsPanel className="lg:col-span-2" title="Submission activity">
              {stats.calendar.length ? (
                <ContributionChart days={stats.calendar} noun="submissions" />
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No submission activity reported this year.
                </p>
              )}
            </StatsPanel>

            <StatsPanel className="lg:col-span-2" title="Recent accepted solutions">
              {stats.recentSubmissions.length ? (
                <div className="mt-5 divide-y divide-border/70">
                  {stats.recentSubmissions.map((submission, index) => (
                    <a
                      className="group flex min-h-14 flex-wrap items-center gap-x-4 gap-y-2 py-3"
                      href={`https://leetcode.com/problems/${encodeURIComponent(submission.titleSlug)}/`}
                      key={`${submission.titleSlug}-${submission.timestamp}-${index}`}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <span className="basis-full text-sm text-foreground group-hover:text-primary sm:flex-1">
                        {submission.title}
                      </span>
                      <span className="font-mono text-[0.6875rem] text-terminal-green">
                        {submission.language}
                      </span>
                      {Number(submission.timestamp) > 0 ? (
                        <span className="font-mono text-[0.6875rem] text-muted-foreground sm:w-24 sm:text-right">
                          {formatDate(new Date(Number(submission.timestamp) * 1000))}
                        </span>
                      ) : null}
                      <ExternalLink aria-hidden="true" className="size-3.5 text-muted-foreground" />
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
    </StatsSection>
  )
}
