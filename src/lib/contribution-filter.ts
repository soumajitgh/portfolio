import type { ContributionCardData } from '@/lib/contribution-data'

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

export type DateRangePreset =
  | ''
  | '7d'
  | '30d'
  | '90d'
  | '6m'
  | 'this-year'
  | '1y'
  | 'custom'

export type ContributionFilters = {
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

export const sortOptions: { label: string; value: ContributionSort }[] = [
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

export const dateRangePresets: { label: string; value: DateRangePreset }[] = [
  { label: 'All time', value: '' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last 6 months', value: '6m' },
  { label: 'This year', value: 'this-year' },
  { label: 'Last 12 months', value: '1y' },
  { label: 'Custom range…', value: 'custom' },
]

export const contributionSorts = new Set<ContributionSort>([
  'changes-asc',
  'changes-desc',
  'newest',
  'oldest',
  'portfolio',
  'repo-asc',
  'repo-desc',
  'stars-asc',
  'stars-desc',
])

export function normalizeRange(value?: string | null): DateRangePreset {
  if (!value) return ''
  const trimmed = value.trim().toLowerCase()
  switch (trimmed) {
    case '7d':
    case '7':
    case '7-days':
    case 'last-7-days':
    case 'last-7d':
    case 'week':
    case 'last-week':
      return '7d'
    case '30d':
    case '30':
    case '30-days':
    case 'last-30-days':
    case 'last-30d':
    case 'month':
    case 'last-month':
      return '30d'
    case '90d':
    case '90':
    case '90-days':
    case 'last-90-days':
    case 'last-90d':
    case 'quarter':
    case 'last-quarter':
      return '90d'
    case '6m':
    case '180d':
    case '180':
    case '6-months':
    case 'last-6-months':
    case 'last-6m':
      return '6m'
    case 'this-year':
    case 'year':
    case 'ytd':
    case 'current-year':
      return 'this-year'
    case '1y':
    case '365d':
    case '365':
    case '1-year':
    case '12m':
    case 'last-year':
    case 'last-12-months':
    case 'last-1y':
      return '1y'
    case 'custom':
      return 'custom'
    default:
      return ''
  }
}

export function parseDateBoundary(
  dateString?: string | null,
  boundary: 'start' | 'end' = 'start',
): number | null {
  if (!dateString) return null
  const trimmed = dateString.trim()
  if (!trimmed) return null

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (match) {
    const year = Number.parseInt(match[1]!, 10)
    const month = Number.parseInt(match[2]!, 10) - 1
    const day = Number.parseInt(match[3]!, 10)

    if (boundary === 'start') {
      return Date.UTC(year, month, day, 0, 0, 0, 0)
    }
    return Date.UTC(year, month, day, 23, 59, 59, 999)
  }

  const parsed = new Date(trimmed).getTime()
  if (Number.isNaN(parsed)) return null
  return parsed
}

export function contributionTimestamp(contribution: ContributionCardData): number {
  const rawDate = contribution.mergedAt || contribution.prCreatedAt
  if (!rawDate) return 0
  const timestamp = new Date(rawDate).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

export function matchesDateRange(
  contribution: ContributionCardData,
  range: DateRangePreset,
  fromDate?: string,
  toDate?: string,
  now: number = Date.now(),
): boolean {
  if (!range && !fromDate && !toDate) return true

  const timestamp = contributionTimestamp(contribution)
  if (!timestamp) return true

  if (range && range !== 'custom') {
    const dayMs = 24 * 60 * 60 * 1000
    if (range === '7d') return timestamp >= now - 7 * dayMs
    if (range === '30d') return timestamp >= now - 30 * dayMs
    if (range === '90d') return timestamp >= now - 90 * dayMs
    if (range === '6m') return timestamp >= now - 182.5 * dayMs
    if (range === '1y') return timestamp >= now - 365 * dayMs
    if (range === 'this-year') {
      const currentYear = new Date(now).getUTCFullYear()
      const startOfYear = Date.UTC(currentYear, 0, 1, 0, 0, 0, 0)
      return timestamp >= startOfYear
    }
  }

  if (fromDate) {
    const fromTime = parseDateBoundary(fromDate, 'start')
    if (fromTime !== null && timestamp < fromTime) return false
  }

  if (toDate) {
    const toTime = parseDateBoundary(toDate, 'end')
    if (toTime !== null && timestamp > toTime) return false
  }

  return true
}

export function matchesSearchQuery(contribution: ContributionCardData, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true

  const searchFields = [
    contribution.title,
    contribution.portfolioSummary,
    contribution.organization,
    contribution.repository,
    contribution.author,
    `#${contribution.prNumber}`,
    String(contribution.prNumber),
    contribution.repoDescription,
    ...(contribution.tags || []).flatMap((item) => [item.name, item.slug]),
  ]

  return searchFields
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedQuery))
}

export function repositoryValue(contribution: ContributionCardData): string {
  return `${contribution.organization}/${contribution.repository}`.toLowerCase()
}

export function sortContributions(
  contributions: ContributionCardData[],
  sort: ContributionSort,
): ContributionCardData[] {
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
