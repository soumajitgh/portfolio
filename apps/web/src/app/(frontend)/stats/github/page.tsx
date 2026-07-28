import { ArrowLeft, ExternalLink, GitFork, Star } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ContributionChart, LanguageChart } from '@/components/stats/stats-charts'
import {
  formatDate,
  StatValue,
  StatsPanel,
  StatsUnavailable,
} from '@/components/stats/stats-ui'
import { getGitHubStats } from '@/lib/stats-data'

export const metadata: Metadata = {
  alternates: { canonical: '/stats/github' },
  description:
    'Detailed GitHub repository, language, contribution, follower, and open-source statistics for fullstack developer Soumajit Ghosh.',
  openGraph: {
    description:
      'Detailed GitHub repository, language, contribution, and open-source statistics for fullstack developer Soumajit Ghosh.',
    title: 'GitHub Stats',
    type: 'website',
    url: '/stats/github',
  },
  title: 'GitHub Stats',
  twitter: {
    card: 'summary_large_image',
    description: 'GitHub contribution and open-source statistics for Soumajit Ghosh.',
    title: 'GitHub Stats',
  },
}

export const revalidate = 900

export default async function GitHubStatsPage() {
  const stats = await getGitHubStats()

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
          <p className="font-mono text-xs text-terminal-green">github / @{stats.username}</p>
          <h1 className="detail-title mt-3 font-semibold">Open-source profile</h1>
          <p className="detail-lede mt-3 max-w-2xl text-muted-foreground">
            Repository reach, technology mix, recent work, and public contribution activity.
          </p>
        </div>
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 font-mono text-xs text-primary transition-colors hover:border-primary/60 hover:bg-accent"
          href={`https://github.com/${encodeURIComponent(stats.username)}`}
          rel="noreferrer"
          target="_blank"
        >
          view profile
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </div>

      {!stats.available ? (
        <StatsUnavailable detail={stats.error} label="GitHub stats" />
      ) : (
        <>
          <div className="mt-9 grid grid-cols-2 gap-4 rounded-lg border border-border bg-card/45 p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-6">
            <StatValue label="public repos" value={stats.publicRepos} />
            <StatValue label="stars earned" tone="yellow" value={stats.totalStars} />
            <StatValue label="forks" tone="cyan" value={stats.totalForks} />
            <StatValue label="followers" tone="purple" value={stats.followers} />
            <StatValue
              label="private commits"
              tone="green"
              value={stats.privateCommits ?? '—'}
            />
            <StatValue label="yearly activity" value={stats.totalContributions || '—'} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <StatsPanel eyebrow="stack" title="Repository languages">
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

            <StatsPanel eyebrow="identity" title={stats.name}>
              <dl className="mt-6 space-y-4 text-sm">
                {[
                  ['handle', `@${stats.username}`],
                  ['location', stats.location || 'not public'],
                  ['company', stats.company || 'independent'],
                  ['public gists', String(stats.publicGists)],
                  ['member since', formatDate(stats.accountCreated)],
                ].map(([label, value]) => (
                  <div
                    className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-border/60 pb-3"
                    key={label}
                  >
                    <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
                    <dd className="min-w-0 truncate text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
              {stats.bio ? <p className="mt-5 text-sm text-muted-foreground">{stats.bio}</p> : null}
            </StatsPanel>

            {stats.contributionDays.length ? (
              <StatsPanel
                className="lg:col-span-2"
                eyebrow="momentum"
                title="Contribution activity"
              >
                <ContributionChart days={stats.contributionDays} />
                <p className="mt-2 text-center font-mono text-[0.6875rem] text-muted-foreground">
                  Includes authorized private activity as anonymous counts. Private repository
                  names are never requested or rendered.
                </p>
              </StatsPanel>
            ) : (
              <StatsPanel
                className="lg:col-span-2"
                eyebrow="momentum"
                title="Contribution activity"
              >
                <StatsUnavailable
                  detail="Set GITHUB_STATS_TOKEN on the server to add the one-year contribution graph. Public repository metrics are already live."
                  label="Contribution timeline"
                />
              </StatsPanel>
            )}

            <StatsPanel className="lg:col-span-2" eyebrow="recently updated" title="Repositories">
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
                      <h3 className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                        {repo.name}
                      </h3>
                      <ExternalLink
                        aria-hidden="true"
                        className="size-3.5 shrink-0 text-muted-foreground"
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 min-h-10 text-xs text-muted-foreground">
                      {repo.description || 'No repository description provided.'}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-[0.6875rem] text-muted-foreground">
                      <span className="text-terminal-blue">{repo.language || 'code'}</span>
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
            </StatsPanel>
          </div>
        </>
      )}
    </main>
  )
}
