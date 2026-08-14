import type { Metadata } from 'next'
import Link from 'next/link'

import { ContributionIssueRow } from '@/components/contributions/contribution-issue-row'
import { FilterSelect } from '@/components/filter-select'
import { getVisibleContributions } from '@/lib/contribution-data'
import { absoluteURL, nonIndexableRobots, serializeJsonLd, siteName } from '@/lib/seo'

export const revalidate = 300

const pageTitle = 'Open Source Contributions'
const pageDescription =
  'Open source pull requests by Soumajit Ghosh across developer tools, applications, and infrastructure projects.'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[] }>
}): Promise<Metadata> {
  const filter = firstValue((await searchParams).filter)

  return {
    alternates: { canonical: '/contributions' },
    description: pageDescription,
    openGraph: {
      description: pageDescription,
      title: pageTitle,
      type: 'website',
      url: '/contributions',
    },
    ...(filter ? { robots: nonIndexableRobots } : {}),
    title: pageTitle,
    twitter: {
      card: 'summary_large_image',
      description: pageDescription,
      title: pageTitle,
    },
  }
}

export default async function ContributionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[] }>
}) {
  const requestedFilter = firstValue((await searchParams).filter)
    .trim()
    .toLowerCase()
  const contributions = await getVisibleContributions()
  const statusFilters = (['merged', 'open', 'closed'] as const)
    .map((status) => ({
      count: contributions.filter((item) => item.status === status).length,
      label: status[0].toUpperCase() + status.slice(1),
      value: status,
    }))
    .filter((filter) => filter.count > 0)
  const tagFilters = Array.from(
    contributions
      .flatMap((contribution) => contribution.tags || [])
      .reduce((tags, tag) => {
        const existing = tags.get(tag.slug)
        tags.set(tag.slug, { count: (existing?.count || 0) + 1, label: tag.name, value: tag.slug })
        return tags
      }, new Map<string, { count: number; label: string; value: string }>())
      .values(),
  ).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  const featuredCount = contributions.filter((item) => item.featured).length
  const filters = [
    { count: contributions.length, label: 'All', value: 'all' },
    ...(featuredCount ? [{ count: featuredCount, label: 'Featured', value: 'featured' }] : []),
    ...statusFilters,
    ...tagFilters,
  ]
  const knownFilters = new Set(filters.map((filter) => filter.value))
  const activeFilter = knownFilters.has(requestedFilter) ? requestedFilter : 'all'
  const visibleContributions = contributions.filter((contribution) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'featured') return contribution.featured
    if (contribution.status === activeFilter) return true
    return contribution.tags?.some((tag) => tag.slug === activeFilter) || false
  })
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    author: { '@type': 'Person', name: siteName, url: absoluteURL('/') },
    description: pageDescription,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: visibleContributions.map((contribution, index) => ({
        '@type': 'ListItem',
        item: {
          '@type': 'CreativeWork',
          description: contribution.portfolioSummary || contribution.title,
          name: contribution.title,
          url: contribution.prUrl,
        },
        position: index + 1,
      })),
      numberOfItems: visibleContributions.length,
    },
    name: pageTitle,
    url: absoluteURL('/contributions'),
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <main className="page-container py-10 sm:py-12 md:py-16">
        <p className="font-mono text-xs text-terminal-green sm:text-sm">
          soumajit@portfolio:<span className="text-terminal-blue">~</span>$ gh pr list --author @me
        </p>
        <h1 className="page-title mt-4 font-semibold">Open source contributions</h1>
        <p className="page-lede mt-4 max-w-2xl text-muted-foreground">
          Pull requests shipped across the open source ecosystem, presented around what changed and
          why it mattered.
        </p>

        <section aria-labelledby="contribution-index-heading" className="mt-8">
          <h2 className="sr-only" id="contribution-index-heading">
            Pull request index
          </h2>

          {filters.length > 1 ? (
            <div className="rounded-lg border border-border bg-card/40 p-3 sm:p-5">
              <FilterSelect
                accessibleLabel="Filter open source contributions"
                allLabel={`All contributions (${contributions.length})`}
                name="filter"
                options={filters.slice(1).map((filter) => ({
                  label: `${filter.label} (${filter.count})`,
                  value: filter.value,
                }))}
                value={activeFilter === 'all' ? '' : activeFilter}
              />
            </div>
          ) : null}

          <div
            aria-live="polite"
            className="mt-5 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted-foreground"
          >
            <span>
              {visibleContributions.length}{' '}
              {visibleContributions.length === 1 ? 'pull request' : 'pull requests'}
            </span>
            <span className="text-terminal-yellow">portfolio order</span>
          </div>

          {visibleContributions.length ? (
            <div className="mt-5 overflow-hidden rounded-lg border border-border/80 bg-card/45">
              <div className="hidden grid-cols-[1.25rem_minmax(0,1fr)_minmax(13rem,auto)] gap-3 border-b border-border/80 bg-muted/20 px-6 py-3 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground sm:grid">
                <span aria-hidden="true" />
                <span>Pull request</span>
                <span className="text-right">Impact / status</span>
              </div>
              <div className="divide-y divide-border/80" role="list">
                {visibleContributions.map((contribution) => (
                  <ContributionIssueRow contribution={contribution} key={contribution.id} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-5 px-4 py-10 text-center font-mono text-sm text-muted-foreground sm:p-10">
              <p>0 pull requests matched this filter</p>
              <Link
                className="mt-3 inline-block text-primary hover:underline"
                href="/contributions"
              >
                ./clear-filter
              </Link>
            </div>
          )}
        </section>

        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
          type="application/ld+json"
        />
      </main>
    </div>
  )
}

const firstValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] || '' : value || ''
