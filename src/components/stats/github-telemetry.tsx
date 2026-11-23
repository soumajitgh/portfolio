import { ExternalLink, GitFork, Star } from 'lucide-react'

import type { GitHubStats } from '@/lib/stats-data'

import { LanguageChart } from './stats-charts'
import {
  ContributionDots,
  formatDate,
  StatValue,
  StatsPanel,
  StatsSection,
  StatsUnavailable,
} from './stats-ui'

export function GitHubTelemetry({ stats }: { stats: GitHubStats }) {
  return (
    <StatsSection
      id="github"
      profileURL={`https://github.com/${encodeURIComponent(stats.username)}`}
      title="GitHub"
      username={stats.username}
    >
      {!stats.available ? (
        <StatsUnavailable detail={stats.error} label="GitHub stats" />
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 gap-4 rounded-lg border border-border bg-card/45 p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-6">
            <StatValue label="public repos" value={stats.publicRepos} />
            <StatValue label="stars earned" tone="yellow" value={stats.totalStars} />
            <StatValue label="forks" tone="cyan" value={stats.totalForks} />
            <StatValue label="followers" tone="purple" value={stats.followers} />
            <StatValue
              label="private commits / year"
              tone="green"
              value={stats.privateCommits ?? '—'}
            />
            <StatValue
              label="contributions / year"
              value={stats.contributionDays.length ? stats.totalContributions : '—'}
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <StatsPanel className="lg:col-span-2" title="Contribution calendar">
              {stats.contributionDays.length ? (
                <ContributionDots days={stats.contributionDays} />
              ) : (
                <StatsUnavailable label="Contribution calendar" />
              )}
            </StatsPanel>

            <StatsPanel title="Repository languages">
              {stats.languages.length ? (
                <LanguageChart
                  items={stats.languages.map((item) => ({
                    name: item.name,
                    value: item.repositories,
                  }))}
                  valueLabel="repositories"
                />
              ) : (
                <StatsUnavailable label="Language stats" />
              )}
            </StatsPanel>

            <StatsPanel title={stats.name}>
              <dl className="mt-6 space-y-4 text-sm">
                {[
                  ['location', stats.location || '—'],
                  ['company', stats.company || '—'],
                  ['following', String(stats.following)],
                  ['public gists', String(stats.publicGists)],
                  ['member since', formatDate(stats.accountCreated)],
                ].map(([label, value]) => (
                  <div
                    className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-border/60 pb-3"
                    key={label}
                  >
                    <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
                    <dd className="min-w-0 break-words text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
              {stats.bio ? <p className="mt-5 text-sm text-muted-foreground">{stats.bio}</p> : null}
            </StatsPanel>

            <StatsPanel className="lg:col-span-2" title="Recently updated repositories">
              {stats.recentRepositories.length ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {stats.recentRepositories.map((repo) => (
                    <a
                      className="group rounded-lg border border-border/70 bg-background/25 p-4 transition-colors hover:border-primary/50"
                      href={repo.url}
                      key={repo.name}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                          {repo.name}
                        </h4>
                        <ExternalLink
                          aria-hidden="true"
                          className="size-3.5 shrink-0 text-muted-foreground"
                        />
                      </div>
                      {repo.description ? (
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                          {repo.description}
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-[0.6875rem] text-muted-foreground">
                        {repo.language ? (
                          <span className="text-terminal-blue">{repo.language}</span>
                        ) : null}
                        <span className="inline-flex items-center gap-1">
                          <Star aria-hidden="true" className="size-3 text-terminal-yellow" />
                          {repo.stars}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <GitFork aria-hidden="true" className="size-3 text-terminal-cyan" />
                          {repo.forks}
                        </span>
                        <span className="ml-auto">{formatDate(repo.updatedAt)}</span>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No recent repositories.</p>
              )}
            </StatsPanel>
          </div>
        </>
      )}
    </StatsSection>
  )
}
