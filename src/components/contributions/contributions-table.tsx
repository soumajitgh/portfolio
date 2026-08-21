'use client'

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileDiff,
  GitMerge,
  GitPullRequest,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
import {
  dateRangePresets,
  matchesDateRange,
  matchesSearchQuery,
  normalizeRange,
  repositoryValue,
  sortContributions,
  sortOptions,
  type ContributionSort,
  type DateRangePreset,
} from '@/lib/contribution-filter'
import { cn } from '@/lib/utils'

export type { ContributionSort, DateRangePreset }

export type InitialFilters = {
  from?: string
  page: number
  query: string
  range?: DateRangePreset
  repository: string
  sort: ContributionSort
  status: string
  tag: string
  to?: string
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
  const [range, setRange] = useState<DateRangePreset>(
    initialFilters.range || (initialFilters.from || initialFilters.to ? 'custom' : ''),
  )
  const [fromDate, setFromDate] = useState(initialFilters.from || '')
  const [toDate, setToDate] = useState(initialFilters.to || '')
  const [page, setPage] = useState(initialFilters.page)

  const tableRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  const stateRef = useRef({
    fromDate,
    page,
    query,
    range,
    repository,
    sort,
    status,
    tag,
    toDate,
  })

  useEffect(() => {
    stateRef.current = {
      fromDate,
      page,
      query,
      range,
      repository,
      sort,
      status,
      tag,
      toDate,
    }
  })

  const updateURL = useCallback(
    (
      next: Partial<{
        from?: string
        page: number
        query: string
        range?: DateRangePreset
        repository: string
        sort: ContributionSort
        status: string
        tag: string
        to?: string
      }> = {},
    ) => {
      const current = stateRef.current
      const values = {
        from: next.from !== undefined ? next.from : current.fromDate,
        page: next.page !== undefined ? next.page : current.page,
        query: next.query !== undefined ? next.query : current.query,
        range: next.range !== undefined ? next.range : current.range,
        repository: next.repository !== undefined ? next.repository : current.repository,
        sort: next.sort !== undefined ? next.sort : current.sort,
        status: next.status !== undefined ? next.status : current.status,
        tag: next.tag !== undefined ? next.tag : current.tag,
        to: next.to !== undefined ? next.to : current.toDate,
      }

      const params = new URLSearchParams()
      if (values.query.trim()) params.set('q', values.query.trim())
      if (values.repository) params.set('repo', values.repository)
      if (values.status) params.set('status', values.status)
      if (values.tag) params.set('tag', values.tag)
      if (values.sort && values.sort !== 'newest') params.set('sort', values.sort)
      if (values.range && values.range !== 'custom') {
        params.set('range', values.range)
      } else if (values.range === 'custom') {
        params.set('range', 'custom')
      }
      if (values.from) params.set('from', values.from)
      if (values.to) params.set('to', values.to)
      if (values.page > 1) params.set('page', String(values.page))

      const queryString = params.toString()
      const nextUrl = queryString ? `/contributions?${queryString}` : '/contributions'
      const currentUrl = window.location.pathname + window.location.search

      if (nextUrl !== currentUrl) {
        window.history.replaceState(null, '', nextUrl)
      }
    },
    [],
  )

  // Listen to browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const search = new URLSearchParams(window.location.search)
      const q = search.get('q') || ''
      const repo = search.get('repo') || ''
      const st = search.get('status') || ''
      const tg = search.get('tag') || ''
      const srt = (search.get('sort') as ContributionSort) || 'newest'
      const rng = normalizeRange(search.get('range'))
      const fr = search.get('from') || ''
      const t = search.get('to') || ''
      const pg = Number.parseInt(search.get('page') || '1', 10)

      setQuery(q)
      setRepository(repo)
      setStatus(st)
      setTag(tg)
      setSort(sortOptions.some((item) => item.value === srt) ? srt : 'newest')
      setRange(rng || (fr || t ? 'custom' : ''))
      setFromDate(fr)
      setToDate(t)
      setPage(Number.isFinite(pg) && pg > 0 ? pg : 1)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Debounced search query URL update
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const timer = setTimeout(() => {
      updateURL({ page: 1, query })
      if (query.trim()) {
        captureEvent('content_search_performed', {
          content_type: 'oss_contribution',
          query: query.trim().slice(0, 100),
          query_length: query.trim().length,
        })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, updateURL])

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
    const filtered = contributions.filter((contribution) => {
      if (repository && repositoryValue(contribution) !== repository) return false
      if (status && contribution.status !== status) return false
      if (tag && !contribution.tags?.some((item) => item.slug === tag)) return false
      if (!matchesDateRange(contribution, range, fromDate, toDate)) return false
      if (!matchesSearchQuery(contribution, query)) return false
      return true
    })

    return sortContributions(filtered, sort)
  }, [contributions, fromDate, query, range, repository, sort, status, tag, toDate])

  const pageCount = Math.max(1, Math.ceil(visibleContributions.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const paginatedContributions = visibleContributions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  )

  function trackFilter(name: string, value: string | Record<string, unknown>) {
    captureEvent('content_filter_changed', {
      filter_name: name,
      filter_value: typeof value === 'string' ? value || 'all' : JSON.stringify(value),
      page_type: 'contributions',
    })
  }

  function changeSort(nextSort: ContributionSort) {
    setSort(nextSort)
    setPage(1)
    updateURL({ page: 1, sort: nextSort })
    trackFilter('sort', nextSort)
  }

  function changeDateRange(nextRange: DateRangePreset) {
    setRange(nextRange)
    setPage(1)

    if (nextRange === 'custom') {
      updateURL({ page: 1, range: 'custom' })
    } else {
      setFromDate('')
      setToDate('')
      updateURL({ from: '', page: 1, range: nextRange, to: '' })
    }
    trackFilter('date_range', nextRange || 'all')
  }

  function clearFilters() {
    setQuery('')
    setRepository('')
    setStatus('')
    setTag('')
    setRange('')
    setFromDate('')
    setToDate('')
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

  const hasActiveFilters = Boolean(
    query.trim() ||
      repository ||
      status ||
      tag ||
      range ||
      fromDate ||
      toDate ||
      sort !== 'newest',
  )

  const activeRangePreset = dateRangePresets.find((item) => item.value === range)
  const selectedRepoLabel = repositoryOptions.find((item) => item.value === repository)?.label
  const selectedTagLabel = tagOptions.find((item) => item.value === tag)?.label
  const selectedSortLabel = sortOptions.find((item) => item.value === sort)?.label

  return (
    <div
      className="scroll-mt-20 overflow-hidden rounded-lg border border-border/80 bg-card/45"
      ref={tableRef}
    >
      <div className="border-b border-border/80 bg-card/70 p-3 sm:p-4">
        <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[minmax(13rem,1.4fr)_repeat(auto-fit,minmax(9.5rem,1fr))]">
          {/* Search Input */}
          <div className="relative min-w-0 sm:col-span-2 md:col-span-3 lg:col-span-1">
            <span className="sr-only">Search contributions</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              aria-label="Search contributions"
              className="terminal-input h-11 w-full rounded-md border border-input bg-background/35 pl-9 pr-8 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 md:h-9"
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              placeholder="Search PRs, summaries, authors…"
              type="search"
              value={query}
            />
            {query ? (
              <button
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  setQuery('')
                  setPage(1)
                  updateURL({ page: 1, query: '' })
                }}
                type="button"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            ) : null}
          </div>

          {/* Date Range Select */}
          <ToolbarSelect
            allLabel="All time"
            label="Date"
            onChange={(value) => changeDateRange(value as DateRangePreset)}
            options={dateRangePresets
              .filter((preset) => preset.value !== '')
              .map((preset) => ({
                label: preset.label,
                value: preset.value,
              }))}
            value={range}
          />

          {/* Repository Select */}
          <ToolbarSelect
            allLabel="All repositories"
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

          {/* Status Select */}
          <ToolbarSelect
            allLabel="All status"
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

          {/* Technology Select */}
          {tagOptions.length ? (
            <ToolbarSelect
              allLabel="All technologies"
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

          {/* Sort Select */}
          <ToolbarSelect
            allLabel="Newest activity"
            label="Sort"
            onChange={(value) => changeSort((value || 'newest') as ContributionSort)}
            options={sortOptions.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
            value={sort}
          />
        </div>

        {/* Custom Date Range Picker Bar */}
        {range === 'custom' || fromDate || toDate ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border/70 bg-background/50 p-2.5 sm:px-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-terminal-cyan">
                <Calendar aria-hidden="true" className="size-3.5" />
                <span>Custom date range:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <span>From</span>
                  <input
                    aria-label="Start date"
                    className="terminal-input h-8 rounded border border-input bg-card px-2 font-mono text-xs text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 [color-scheme:dark]"
                    max={toDate || undefined}
                    onChange={(event) => {
                      const nextFrom = event.target.value
                      setFromDate(nextFrom)
                      setRange('custom')
                      setPage(1)
                      updateURL({ from: nextFrom, page: 1, range: 'custom' })
                      trackFilter('custom_date_from', nextFrom)
                    }}
                    type="date"
                    value={fromDate}
                  />
                </label>

                <label className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <span>To</span>
                  <input
                    aria-label="End date"
                    className="terminal-input h-8 rounded border border-input bg-card px-2 font-mono text-xs text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 [color-scheme:dark]"
                    min={fromDate || undefined}
                    onChange={(event) => {
                      const nextTo = event.target.value
                      setToDate(nextTo)
                      setRange('custom')
                      setPage(1)
                      updateURL({ page: 1, range: 'custom', to: nextTo })
                      trackFilter('custom_date_to', nextTo)
                    }}
                    type="date"
                    value={toDate}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {fromDate || toDate ? (
                <button
                  className="inline-flex h-7 items-center gap-1 rounded px-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    setFromDate('')
                    setToDate('')
                    setPage(1)
                    updateURL({ from: '', page: 1, range: 'custom', to: '' })
                    trackFilter('custom_date_clear', 'cleared')
                  }}
                  type="button"
                >
                  <X aria-hidden="true" className="size-3" />
                  Clear dates
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Active Filter Chips / Status Bar */}
        {hasActiveFilters ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2.5 font-mono text-[0.6875rem]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground">
                Showing {visibleContributions.length} of {contributions.length}:
              </span>

              {query.trim() ? (
                <FilterChip
                  label={`q: "${query.trim()}"`}
                  onRemove={() => {
                    setQuery('')
                    setPage(1)
                    updateURL({ page: 1, query: '' })
                  }}
                />
              ) : null}

              {range ? (
                <FilterChip
                  label={
                    range === 'custom'
                      ? fromDate || toDate
                        ? `date: ${fromDate || '…'} → ${toDate || '…'}`
                        : 'date: custom'
                      : `date: ${activeRangePreset?.label || range}`
                  }
                  onRemove={() => {
                    setRange('')
                    setFromDate('')
                    setToDate('')
                    setPage(1)
                    updateURL({ from: '', page: 1, range: '', to: '' })
                  }}
                />
              ) : fromDate || toDate ? (
                <FilterChip
                  label={`date: ${fromDate || '…'} → ${toDate || '…'}`}
                  onRemove={() => {
                    setFromDate('')
                    setToDate('')
                    setPage(1)
                    updateURL({ from: '', page: 1, to: '' })
                  }}
                />
              ) : null}

              {repository ? (
                <FilterChip
                  label={`repo: ${selectedRepoLabel || repository}`}
                  onRemove={() => {
                    setRepository('')
                    setPage(1)
                    updateURL({ page: 1, repository: '' })
                  }}
                />
              ) : null}

              {status ? (
                <FilterChip
                  label={`status: ${statusLabels[status as keyof typeof statusLabels] || status}`}
                  onRemove={() => {
                    setStatus('')
                    setPage(1)
                    updateURL({ page: 1, status: '' })
                  }}
                />
              ) : null}

              {tag ? (
                <FilterChip
                  label={`tech: ${selectedTagLabel || tag}`}
                  onRemove={() => {
                    setTag('')
                    setPage(1)
                    updateURL({ page: 1, tag: '' })
                  }}
                />
              ) : null}

              {sort !== 'newest' ? (
                <FilterChip
                  label={`sort: ${selectedSortLabel || sort}`}
                  onRemove={() => changeSort('newest')}
                />
              ) : null}
            </div>

            <button
              className="inline-flex items-center gap-1 text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={clearFilters}
              type="button"
            >
              <RotateCcw aria-hidden="true" className="size-3" />
              Reset all
            </button>
          </div>
        ) : null}
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
                <div className="mx-auto max-w-sm space-y-3">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-full border border-border/80 bg-background/50 text-muted-foreground">
                    <SlidersHorizontal aria-hidden="true" className="size-4" />
                  </div>
                  <p className="font-mono text-sm text-muted-foreground">
                    No pull requests match these filters.
                  </p>
                  {hasActiveFilters ? (
                    <Button className="mt-1" onClick={clearFilters} size="sm" variant="outline">
                      <RotateCcw aria-hidden="true" className="size-3.5" />
                      Clear filters
                    </Button>
                  ) : null}
                </div>
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
  allLabel,
  label,
  onChange,
  options,
  value,
}: {
  allLabel: string
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
        <option value="">{allLabel}</option>
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

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-border/80 bg-background/60 px-1.5 py-0.5 text-foreground">
      <span>{label}</span>
      <button
        aria-label={`Remove filter ${label}`}
        className="rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onClick={onRemove}
        type="button"
      >
        <X aria-hidden="true" className="size-3" />
      </button>
    </span>
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

function formatContributionDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(value))
}
