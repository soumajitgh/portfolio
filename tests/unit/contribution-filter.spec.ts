import { describe, expect, it } from 'vitest'

import type { ContributionCardData } from '@/lib/contribution-data'
import {
  contributionTimestamp,
  matchesDateRange,
  matchesSearchQuery,
  normalizeRange,
  parseDateBoundary,
  repositoryValue,
  sortContributions,
} from '@/lib/contribution-filter'

const mockContribution = (overrides: Partial<ContributionCardData> = {}): ContributionCardData => ({
  additions: 100,
  author: 'soumajit',
  changedFiles: 3,
  deletions: 20,
  featured: false,
  id: 1,
  mergedAt: '2026-08-15T12:00:00.000Z',
  organization: 'facebook',
  portfolioSummary: 'Fixed cache eviction in relay query engine',
  prCreatedAt: '2026-08-14T10:00:00.000Z',
  prNumber: 42,
  prUrl: 'https://github.com/facebook/react/pull/42',
  repoDescription: 'The library for web and native user interfaces',
  repository: 'react',
  repoUrl: 'https://github.com/facebook/react',
  stars: 220000,
  status: 'merged',
  tags: [{ id: '1', name: 'React', slug: 'react' }],
  title: 'Fix cache eviction race condition in relay store',
  ...overrides,
})

describe('normalizeRange', () => {
  it('normalizes preset strings and aliases', () => {
    expect(normalizeRange('7d')).toBe('7d')
    expect(normalizeRange('last-7-days')).toBe('7d')
    expect(normalizeRange('30d')).toBe('30d')
    expect(normalizeRange('last-30d')).toBe('30d')
    expect(normalizeRange('month')).toBe('30d')
    expect(normalizeRange('90d')).toBe('90d')
    expect(normalizeRange('quarter')).toBe('90d')
    expect(normalizeRange('6m')).toBe('6m')
    expect(normalizeRange('180d')).toBe('6m')
    expect(normalizeRange('this-year')).toBe('this-year')
    expect(normalizeRange('year')).toBe('this-year')
    expect(normalizeRange('1y')).toBe('1y')
    expect(normalizeRange('365d')).toBe('1y')
    expect(normalizeRange('custom')).toBe('custom')
    expect(normalizeRange('')).toBe('')
    expect(normalizeRange(null)).toBe('')
    expect(normalizeRange('unknown-val')).toBe('')
  })
})

describe('parseDateBoundary', () => {
  it('parses start of day boundary as UTC midnight', () => {
    const timestamp = parseDateBoundary('2026-08-15', 'start')
    expect(timestamp).toBe(Date.UTC(2026, 7, 15, 0, 0, 0, 0))
  })

  it('parses end of day boundary as UTC 23:59:59.999', () => {
    const timestamp = parseDateBoundary('2026-08-15', 'end')
    expect(timestamp).toBe(Date.UTC(2026, 7, 15, 23, 59, 59, 999))
  })

  it('returns null for empty or invalid date strings', () => {
    expect(parseDateBoundary('')).toBeNull()
    expect(parseDateBoundary(null)).toBeNull()
    expect(parseDateBoundary('not-a-date')).toBeNull()
  })
})

describe('matchesDateRange', () => {
  const referenceTime = Date.UTC(2026, 7, 21, 12, 0, 0) // 2026-08-21 12:00 UTC

  it('returns true when no range or custom dates are specified', () => {
    const pr = mockContribution({ mergedAt: '2026-08-15T12:00:00.000Z' })
    expect(matchesDateRange(pr, '', '', '', referenceTime)).toBe(true)
  })

  it('matches 7d preset correctly', () => {
    const recentPr = mockContribution({ mergedAt: '2026-08-18T10:00:00.000Z' })
    const olderPr = mockContribution({ mergedAt: '2026-08-10T10:00:00.000Z' })

    expect(matchesDateRange(recentPr, '7d', undefined, undefined, referenceTime)).toBe(true)
    expect(matchesDateRange(olderPr, '7d', undefined, undefined, referenceTime)).toBe(false)
  })

  it('matches 30d preset correctly', () => {
    const insidePr = mockContribution({ mergedAt: '2026-08-01T10:00:00.000Z' })
    const outsidePr = mockContribution({ mergedAt: '2026-07-01T10:00:00.000Z' })

    expect(matchesDateRange(insidePr, '30d', undefined, undefined, referenceTime)).toBe(true)
    expect(matchesDateRange(outsidePr, '30d', undefined, undefined, referenceTime)).toBe(false)
  })

  it('matches this-year preset correctly', () => {
    const thisYearPr = mockContribution({ mergedAt: '2026-02-10T10:00:00.000Z' })
    const lastYearPr = mockContribution({ mergedAt: '2025-12-31T23:59:59.000Z' })

    expect(matchesDateRange(thisYearPr, 'this-year', undefined, undefined, referenceTime)).toBe(true)
    expect(matchesDateRange(lastYearPr, 'this-year', undefined, undefined, referenceTime)).toBe(false)
  })

  it('filters by custom from and to dates', () => {
    const pr = mockContribution({ mergedAt: '2026-08-15T12:00:00.000Z' })

    // Inside range
    expect(matchesDateRange(pr, 'custom', '2026-08-01', '2026-08-20', referenceTime)).toBe(true)
    // Same day boundary match
    expect(matchesDateRange(pr, 'custom', '2026-08-15', '2026-08-15', referenceTime)).toBe(true)
    // Before from date
    expect(matchesDateRange(pr, 'custom', '2026-08-16', '2026-08-20', referenceTime)).toBe(false)
    // After to date
    expect(matchesDateRange(pr, 'custom', '2026-08-01', '2026-08-14', referenceTime)).toBe(false)
    // Only from date specified
    expect(matchesDateRange(pr, 'custom', '2026-08-10', '', referenceTime)).toBe(true)
    expect(matchesDateRange(pr, 'custom', '2026-08-16', '', referenceTime)).toBe(false)
    // Only to date specified
    expect(matchesDateRange(pr, 'custom', '', '2026-08-20', referenceTime)).toBe(true)
    expect(matchesDateRange(pr, 'custom', '', '2026-08-14', referenceTime)).toBe(false)
  })
})

describe('matchesSearchQuery', () => {
  const pr = mockContribution({
    author: 'soumajit',
    organization: 'vercel',
    portfolioSummary: 'Optimized server action streaming serialization',
    prNumber: 999,
    repository: 'next.js',
    tags: [{ id: '1', name: 'TypeScript', slug: 'typescript' }],
    title: 'Streaming fix for turbo pack worker',
  })

  it('matches title, summary, author, repo, and tags', () => {
    expect(matchesSearchQuery(pr, '')).toBe(true)
    expect(matchesSearchQuery(pr, 'Streaming fix')).toBe(true)
    expect(matchesSearchQuery(pr, 'server action')).toBe(true)
    expect(matchesSearchQuery(pr, 'vercel')).toBe(true)
    expect(matchesSearchQuery(pr, 'next.js')).toBe(true)
    expect(matchesSearchQuery(pr, 'soumajit')).toBe(true)
    expect(matchesSearchQuery(pr, '#999')).toBe(true)
    expect(matchesSearchQuery(pr, '999')).toBe(true)
    expect(matchesSearchQuery(pr, 'typescript')).toBe(true)
    expect(matchesSearchQuery(pr, 'nonexistent query')).toBe(false)
  })
})

describe('sortContributions', () => {
  const pr1 = mockContribution({
    additions: 10,
    deletions: 5,
    id: 1,
    mergedAt: '2026-08-10T10:00:00.000Z',
    organization: 'aaa',
    repository: 'alpha',
    stars: 50,
  })
  const pr2 = mockContribution({
    additions: 100,
    deletions: 50,
    id: 2,
    mergedAt: '2026-08-15T10:00:00.000Z',
    organization: 'bbb',
    repository: 'beta',
    stars: 500,
  })

  it('sorts newest and oldest', () => {
    expect(sortContributions([pr1, pr2], 'newest').map((p) => p.id)).toEqual([2, 1])
    expect(sortContributions([pr1, pr2], 'oldest').map((p) => p.id)).toEqual([1, 2])
  })

  it('sorts changes-desc and changes-asc', () => {
    expect(sortContributions([pr1, pr2], 'changes-desc').map((p) => p.id)).toEqual([2, 1])
    expect(sortContributions([pr1, pr2], 'changes-asc').map((p) => p.id)).toEqual([1, 2])
  })

  it('sorts stars-desc and stars-asc', () => {
    expect(sortContributions([pr1, pr2], 'stars-desc').map((p) => p.id)).toEqual([2, 1])
    expect(sortContributions([pr1, pr2], 'stars-asc').map((p) => p.id)).toEqual([1, 2])
  })

  it('sorts repo-asc and repo-desc', () => {
    expect(sortContributions([pr1, pr2], 'repo-asc').map((p) => p.id)).toEqual([1, 2])
    expect(sortContributions([pr1, pr2], 'repo-desc').map((p) => p.id)).toEqual([2, 1])
  })
})

describe('repositoryValue and contributionTimestamp', () => {
  it('formats repository value in lowercase', () => {
    const pr = mockContribution({ organization: 'Facebook', repository: 'React' })
    expect(repositoryValue(pr)).toBe('facebook/react')
  })

  it('computes timestamp accurately from mergedAt or prCreatedAt', () => {
    const prMerged = mockContribution({
      mergedAt: '2026-08-15T12:00:00.000Z',
      prCreatedAt: '2026-08-10T12:00:00.000Z',
    })
    expect(contributionTimestamp(prMerged)).toBe(new Date('2026-08-15T12:00:00.000Z').getTime())

    const prOpen = mockContribution({
      mergedAt: null,
      prCreatedAt: '2026-08-10T12:00:00.000Z',
    })
    expect(contributionTimestamp(prOpen)).toBe(new Date('2026-08-10T12:00:00.000Z').getTime())
  })
})
