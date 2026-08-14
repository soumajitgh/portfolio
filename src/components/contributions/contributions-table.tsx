'use client'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileDiff,
  GitMerge,
  GitPullRequest,
  RotateCcw,
  Search,
  Star,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { captureEvent } from '@/lib/analytics'
import type { ContributionCardData } from '@/lib/contribution-data'
import { cn } from '@/lib/utils'

export type ContributionSort =
  | 'changes-asc'
  | 'changes-desc'
  | 'newest'
  | 'oldest'
  | 'portfolio'
  | 'repo-asc'
  | 'repo-desc'
  | 'stars-asc'
  | 'stars-desc'

type InitialFilters = {
  page: number
  query: string
  repository: string
  sort: ContributionSort
  status: string
  tag: string
}

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

const sortOptions: { label: string; value: ContributionSort }[] = [
  { label: 'Newest activity', value: 'newest' },
  { label: 'Oldest activity', value: 'oldest' },
  { label: 'Portfolio order', value: 'portfolio' },
  { label: 'Repository A–Z', value: 'repo-asc' },
  { label: 'Repository Z–A', value: 'repo-desc' },
  { label: 'Most changes', value: 'changes-desc' },
  { label: 'Fewest changes', value: 'changes-asc' },
  { label: 'Most stars', value: 'stars-desc' },
  { label: 'Fewest stars', value: 'stars-asc' },
]

const pageSize = 10

export function ContributionsTable({
  contributions,
  initialFilters,
}: {
  contributions: ContributionCardData[]
  initialFilters: InitialFilters
}) {
  const [query, setQuery] = useState(initialFilters.query)
  const [repository, setRepository] = useState(initialFilters.repository)
  const [status, setStatus] = useState(initialFilters.status)
  const [tag, setTag] = useState(initialFilters.tag)
  const [sort, setSort] = useState<ContributionSort>(initialFilters.sort)
  const [page, setPage] = useState(initialFilters.page)
  const tableRef = useRef<HTMLDivElement>(null)

  const repositoryOptions = useMemo(() => {
    const counts = new Map<string, { count: number; label: string }>()
    for (const contribution of contributions) {
      const value = repositoryValue(contribution)
      const existing = counts.get(value)
      counts.set(value, {
        count: (existing?.count || 0) + 1,
        label: `${contribution.organization}/${contribution.repository}`,
      })
    }
    return [...counts.entries()]
      .map(([value, item]) => ({ ...item, value }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [contributions])

  const tagOptions = useMemo(() => {
    const counts = new Map<string, { count: number; label: string }>()
    for (const contribution of contributions) {
      for (const item of contribution.tags || []) {
        const existing = counts.get(item.slug)
        counts.set(item.slug, { count: (existing?.count || 0) + 1, label: item.name })
      }
    }
    return [...counts.entries()]
      .map(([value, item]) => ({ ...item, value }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }, [contributions])

  const visibleContributions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = contributions.filter((contribution) => {
      if (repository && repositoryValue(contribution) !== repository) return false
      if (status && contribution.status !== status) return false
      if (tag && !contribution.tags?.some((item) => item.slug === tag)) return false
      if (!normalizedQuery) return true

      return [
        contribution.title,
        contribution.portfolioSummary,
        contribution.organization,
        contribution.repository,
        contribution.author,
        `#${contribution.prNumber}`,
        ...(contribution.tags || []).flatMap((item) => [item.name, item.slug]),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    })

    return sortContributions(filtered, sort)
  }, [contributions, query, repository, sort, status, tag])

  const pageCount = Math.max(1, Math.ceil(visibleContributions.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const paginatedContributions = visibleContributions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  function updateURL(next: Partial<InitialFilters>) {
    const values = { page, query, repository, sort, status, tag, ...next }
    const params = new URLSearchParams()
    if (values.query.trim()) params.set('q', values.query.trim())
    if (values.repository) params.set('repo', values.repository)
    if (values.status) params.set('status', values.status)
    if (values.tag) params.set('tag', values.tag)
    if (values.sort !== 'newest') params.set('sort', values.sort)
    if (values.page > 1) params.set('page', String(values.page))
    const queryString = params.toString()
    window.history.replaceState(
      null,
      '',
      queryString ? `/contributions?${queryString}` : '/contributions',
    )
  }

  function trackFilter(name: string, value: string) {
    captureEvent('content_filter_changed', {
      filter_name: name,
      filter_value: value || 'all',
      page_type: 'contributions',
    })
  }

  function changeSort(nextSort: ContributionSort) {
    setSort(nextSort)
    setPage(1)
    updateURL({ page: 1, sort: nextSort })
    trackFilter('sort', nextSort)
  }

  function clearFilters() {
    setQuery('')
    setRepository('')
    setStatus('')
    setTag('')
    setSort('newest')
    setPage(1)
    window.history.replaceState(null, '', '/contributions')
    trackFilter('all', 'cleared')
  }

  function changePage(nextPage: number) {
    const safePage = Math.min(Math.max(nextPage, 1), pageCount)
    setPage(safePage)
    updateURL({ page: safePage })
    requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div
      className="scroll-mt-20 overflow-hidden rounded-lg border border-border/80 bg-card/45"
      ref={tableRef}
    >
      <div className="border-b border-border/80 bg-card/70 p-3 sm:p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(15rem,1fr)_minmax(12rem,auto)_auto_auto_auto]">
          <label className="relative min-w-0 sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Search contributions</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              className="terminal-input h-11 w-full rounded-md border border-input bg-background/35 pl-9 pr-3 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 md:h-9"
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
                updateURL({ page: 1, query: event.target.value })
              }}
              placeholder="Search PRs, summaries, authors…"
              type="search"
              value={query}
            />
          </label>

          <ToolbarSelect
            label="Repository"
            onChange={(value) => {
              setRepository(value)
              setPage(1)
              updateURL({ page: 1, repository: value })
              trackFilter('repository', value)
            }}
            options={repositoryOptions.map((item) => ({
              label: `${item.label} (${item.count})`,
              value: item.value,
            }))}
            value={repository}
          />

          <ToolbarSelect
            label="Status"
            onChange={(value) => {
              setStatus(value)
              setPage(1)
              updateURL({ page: 1, status: value })
              trackFilter('status', value)
            }}
            options={(['merged', 'open'] as const)
              .map((value) => ({
                label: `${statusLabels[value]} (${contributions.filter((item) => item.status === value).length})`,
                value,
              }))
              .filter((item) => !item.label.endsWith('(0)'))}
            value={status}
          />

          {tagOptions.length ? (
            <ToolbarSelect
              label="Technology"
              onChange={(value) => {
                setTag(value)
                setPage(1)
                updateURL({ page: 1, tag: value })
                trackFilter('technology', value)
              }}
              options={tagOptions.map((item) => ({
                label: `${item.label} (${item.count})`,
                value: item.value,
              }))}
              value={tag}
            />
          ) : null}

          <ToolbarSelect
            label="Sort"
            onChange={(value) => changeSort(value as ContributionSort)}
            options={sortOptions}
            value={sort}
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>
              <SortButton
                active={sort === 'repo-asc' || sort === 'repo-desc'}
                direction={sort === 'repo-asc' ? 'asc' : sort === 'repo-desc' ? 'desc' : null}
                label="Pull request"
                onClick={() => changeSort(sort === 'repo-asc' ? 'repo-desc' : 'repo-asc')}
              />
            </TableHead>
            <TableHead className="hidden w-28 sm:table-cell">Status</TableHead>
            <TableHead className="hidden w-36 lg:table-cell">
              <SortButton
                active={sort === 'changes-asc' || sort === 'changes-desc'}
                direction={sort === 'changes-asc' ? 'asc' : sort === 'changes-desc' ? 'desc' : null}
                label="Changes"
                onClick={() => changeSort(sort === 'changes-desc' ? 'changes-asc' : 'changes-desc')}
              />
            </TableHead>
            <TableHead className="hidden w-28 lg:table-cell">
              <SortButton
                active={sort === 'stars-asc' || sort === 'stars-desc'}
                direction={sort === 'stars-asc' ? 'asc' : sort === 'stars-desc' ? 'desc' : null}
                label="Stars"
                onClick={() => changeSort(sort === 'stars-desc' ? 'stars-asc' : 'stars-desc')}
              />
            </TableHead>
            <TableHead className="hidden w-36 xl:table-cell">
              <SortButton
                active={sort === 'newest' || sort === 'oldest'}
                direction={sort === 'oldest' ? 'asc' : sort === 'newest' ? 'desc' : null}
                label="Activity"
                onClick={() => changeSort(sort === 'newest' ? 'oldest' : 'newest')}
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedContributions.length ? (
            paginatedContributions.map((contribution) => (
              <ContributionTableRow contribution={contribution} key={contribution.id} />
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell className="py-12 text-center" colSpan={5}>
                <p className="font-mono text-sm text-muted-foreground">
                  No pull requests match these filters.
                </p>
                <Button className="mt-3" onClick={clearFilters} size="sm" variant="outline">
                  <RotateCcw aria-hidden="true" />
                  Clear filters
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pageCount > 1 ? (
        <nav
          aria-label="Contribution pages"
          className="flex items-center justify-between gap-3 border-t border-border/80 bg-card/70 px-3 py-3 sm:px-4"
        >
          <Button
            disabled={currentPage === 1}
            onClick={() => changePage(currentPage - 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            <ChevronLeft aria-hidden="true" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <span className="font-mono text-[0.6875rem] text-muted-foreground">
            Page {currentPage} of {pageCount}
          </span>
          <Button
            disabled={currentPage === pageCount}
            onClick={() => changePage(currentPage + 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      ) : null}
    </div>
  )
}

function ContributionTableRow({ contribution }: { contribution: ContributionCardData }) {
  const isMerged = contribution.status === 'merged'
  const StatusIcon = isMerged ? GitMerge : GitPullRequest
  const activityDate = contribution.mergedAt || contribution.prCreatedAt
  const summary = contribution.portfolioSummary?.trim() || contribution.title

  return (
    <TableRow>
      <TableCell className="min-w-0">
        <div className="flex min-w-0 gap-3">
          <StatusIcon
            aria-label={`${statusLabels[contribution.status]} pull request`}
            className={cn('mt-0.5 size-4 shrink-0', statusIconStyles[contribution.status])}
            role="img"
          />
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.6875rem]">
              <a
                className="break-all text-terminal-cyan hover:underline"
                href={contribution.repoUrl}
                rel="noreferrer"
                target="_blank"
              >
                {contribution.organization}/{contribution.repository}
              </a>
              <span className="text-muted-foreground">#{contribution.prNumber}</span>
              {contribution.featured ? (
                <span className="text-terminal-yellow">featured</span>
              ) : null}
            </div>
            <a
              className="mt-1 block break-words font-mono text-sm font-semibold leading-5 text-foreground outline-none transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring sm:text-base sm:leading-6"
              href={contribution.prUrl}
              rel="noreferrer"
              target="_blank"
            >
              {contribution.title}
            </a>
            <p className="mt-1 line-clamp-2 max-w-3xl text-xs leading-5 text-muted-foreground sm:text-[0.8125rem]">
              {summary}
            </p>
            <p className="mt-1.5 font-mono text-[0.625rem] leading-4 text-muted-foreground sm:text-[0.6875rem]">
              @{contribution.author} · {formatContributionDate(activityDate)}
              {contribution.tags?.length
                ? ` · ${contribution.tags.map((item) => item.name).join(' / ')}`
                : ''}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-[0.6875rem] sm:hidden">
              <StatusBadge contribution={contribution} />
              <span className="text-terminal-green">+{contribution.additions}</span>
              <span className="text-terminal-red">-{contribution.deletions}</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <FileDiff aria-hidden="true" className="size-3" />
                {contribution.changedFiles}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Star aria-hidden="true" className="size-3" />
                {contribution.stars.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <StatusBadge contribution={contribution} />
      </TableCell>
      <TableCell className="hidden font-mono text-xs lg:table-cell">
        <div className="flex items-center gap-2">
          <span className="text-terminal-green">+{contribution.additions}</span>
          <span className="text-terminal-red">-{contribution.deletions}</span>
        </div>
        <span className="mt-1 flex items-center gap-1 text-[0.6875rem] text-muted-foreground">
          <FileDiff aria-hidden="true" className="size-3" />
          {contribution.changedFiles} {contribution.changedFiles === 1 ? 'file' : 'files'}
        </span>
      </TableCell>
      <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
        <span className="flex items-center gap-1">
          <Star aria-hidden="true" className="size-3.5" />
          {contribution.stars.toLocaleString('en-IN')}
        </span>
      </TableCell>
      <TableCell className="hidden font-mono text-[0.6875rem] text-muted-foreground xl:table-cell">
        {formatContributionDate(activityDate)}
      </TableCell>
    </TableRow>
  )
}

function StatusBadge({ contribution }: { contribution: ContributionCardData }) {
  const StatusIcon = contribution.status === 'merged' ? GitMerge : GitPullRequest
  return (
    <Badge
      className={cn('min-h-8 px-2 sm:min-h-0', statusStyles[contribution.status])}
      variant="outline"
    >
      <StatusIcon aria-hidden="true" />
      {statusLabels[contribution.status]}
    </Badge>
  )
}

function ToolbarSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  value: string
}) {
  return (
    <label className="relative min-w-0">
      <span className="sr-only">{label}</span>
      <select
        className="terminal-input h-11 w-full min-w-0 appearance-none rounded-md border border-input bg-background/35 px-3 pr-8 font-mono text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 md:h-9"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
    </label>
  )
}

function SortButton({
  active,
  direction,
  label,
  onClick,
}: {
  active: boolean
  direction: 'asc' | 'desc' | null
  label: string
  onClick: () => void
}) {
  const Icon = !active ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown
  return (
    <button
      className={cn(
        '-ml-2 inline-flex h-8 items-center gap-1 rounded-md px-2 outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
        active && 'text-primary',
      )}
      onClick={onClick}
      type="button"
    >
      {label}
      <Icon aria-hidden="true" className="size-3" />
    </button>
  )
}

function repositoryValue(contribution: ContributionCardData) {
  return `${contribution.organization}/${contribution.repository}`.toLowerCase()
}

function contributionTimestamp(contribution: ContributionCardData) {
  return new Date(contribution.mergedAt || contribution.prCreatedAt).getTime()
}

function sortContributions(contributions: ContributionCardData[], sort: ContributionSort) {
  if (sort === 'portfolio') return contributions

  return [...contributions].sort((a, b) => {
    if (sort === 'newest') return contributionTimestamp(b) - contributionTimestamp(a)
    if (sort === 'oldest') return contributionTimestamp(a) - contributionTimestamp(b)
    if (sort === 'changes-desc') return b.additions + b.deletions - (a.additions + a.deletions)
    if (sort === 'changes-asc') return a.additions + a.deletions - (b.additions + b.deletions)
    if (sort === 'stars-desc') return b.stars - a.stars
    if (sort === 'stars-asc') return a.stars - b.stars

    const comparison = repositoryValue(a).localeCompare(repositoryValue(b))
    return sort === 'repo-desc' ? -comparison : comparison
  })
}

function formatContributionDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(value))
}
