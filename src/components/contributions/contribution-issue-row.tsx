import { FileDiff, GitMerge, GitPullRequest, Star } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import type { ContributionCardData } from '@/lib/contribution-data'

const statusStyles = {
  closed: 'border-terminal-red/45 text-terminal-red',
  merged: 'border-terminal-purple/45 text-terminal-purple',
  open: 'border-terminal-green/45 text-terminal-green',
} as const

const statusLabels = {
  closed: 'Closed',
  merged: 'Merged',
  open: 'Open',
} as const

const statusIconStyles = {
  closed: 'text-terminal-red',
  merged: 'text-terminal-purple',
  open: 'text-terminal-green',
} as const

export function ContributionIssueRow({ contribution }: { contribution: ContributionCardData }) {
  const isMerged = contribution.status === 'merged'
  const StatusIcon = isMerged ? GitMerge : GitPullRequest
  const contributionDate = contribution.mergedAt || contribution.prCreatedAt
  const summary = contribution.portfolioSummary?.trim() || contribution.title
  const dateVerb = isMerged ? 'merged' : contribution.status === 'open' ? 'opened' : 'closed'

  return (
    <article
      className="group grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 gap-y-4 px-4 py-5 transition-colors hover:bg-accent/20 focus-within:bg-accent/20 sm:grid-cols-[1.25rem_minmax(0,1fr)_minmax(13rem,auto)] sm:px-6 sm:py-6"
      role="listitem"
    >
      <StatusIcon
        aria-label={`${statusLabels[contribution.status]} pull request`}
        className={`mt-1 size-4 sm:size-5 ${statusIconStyles[contribution.status]}`}
        role="img"
      />

      <div className="min-w-0">
        <div className="relative z-10 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.6875rem] sm:text-xs">
          <a
            className="min-h-9 content-center text-terminal-cyan hover:underline sm:min-h-0"
            href={contribution.repoUrl}
            rel="noreferrer"
            target="_blank"
          >
            {contribution.organization}/{contribution.repository}
          </a>
          {contribution.featured ? <span className="text-terminal-yellow">featured</span> : null}
        </div>

        <h2 className="mt-1 break-words font-mono text-sm font-semibold leading-5 tracking-[-0.025em] sm:text-lg sm:leading-7">
          <a
            className="rounded-sm py-1 text-foreground outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
            href={contribution.prUrl}
            rel="noreferrer"
            target="_blank"
          >
            {contribution.title}
          </a>
        </h2>
        <p className="mt-1 font-mono text-[0.6875rem] leading-5 text-muted-foreground sm:text-xs">
          #{contribution.prNumber} {dateVerb} {formatContributionDate(contributionDate)} by @
          {contribution.author}
        </p>
        <p className="mt-2 line-clamp-3 max-w-3xl text-[0.8125rem] leading-5 text-muted-foreground sm:mt-3 sm:line-clamp-2 sm:text-sm sm:leading-6">
          {summary}
        </p>

        {contribution.tags?.length ? (
          <div className="relative z-10 mt-3 flex min-w-0 flex-wrap gap-2 sm:hidden">
            {contribution.tags.map((tag) => (
              <Badge
                asChild
                className="min-h-9 px-2 text-[0.6875rem] text-terminal-blue"
                key={tag.slug}
                variant="outline"
              >
                <Link href={`/contributions?filter=${encodeURIComponent(tag.slug)}`}>
                  {tag.name}
                </Link>
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <aside className="col-start-2 flex min-w-0 flex-col gap-3 sm:col-start-auto sm:items-end sm:text-right">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs sm:justify-end">
          <span className="text-terminal-green">+{contribution.additions}</span>
          <span className="text-terminal-red">-{contribution.deletions}</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <FileDiff aria-hidden="true" className="size-3.5" />
            {contribution.changedFiles}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Star aria-hidden="true" className="size-3.5" />
            {contribution.stars.toLocaleString('en-IN')}
          </span>
        </div>

        <Badge className={statusStyles[contribution.status]} variant="outline">
          <StatusIcon aria-hidden="true" />
          {statusLabels[contribution.status]}
        </Badge>

        {contribution.tags?.length ? (
          <div className="relative z-10 hidden max-w-72 flex-wrap justify-end gap-2 sm:flex">
            {contribution.tags.map((tag) => (
              <Badge asChild className="text-terminal-blue" key={tag.slug} variant="outline">
                <Link href={`/contributions?filter=${encodeURIComponent(tag.slug)}`}>
                  {tag.name}
                </Link>
              </Badge>
            ))}
          </div>
        ) : null}
      </aside>
    </article>
  )
}

function formatContributionDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(value))
}
