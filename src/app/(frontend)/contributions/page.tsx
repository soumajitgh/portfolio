import type { Metadata } from 'next'

import { ContributionsTable } from '@/components/contributions/contributions-table'
import { getVisibleContributions } from '@/lib/contribution-data'
import {
  contributionSorts,
  normalizeRange,
  type ContributionSort,
  type DateRangePreset,
} from '@/lib/contribution-filter'
import { absoluteURL, nonIndexableRobots, serializeJsonLd, siteName } from '@/lib/seo'

export const revalidate = 300

const pageTitle = 'Open Source Contributions'
const pageDescription =
  'Open source pull requests by Soumajit Ghosh across developer tools, applications, and infrastructure projects.'

type ContributionsSearchParams = {
  filter?: string | string[]
  from?: string | string[]
  page?: string | string[]
  q?: string | string[]
  range?: string | string[]
  repo?: string | string[]
  sort?: string | string[]
  status?: string | string[]
  tag?: string | string[]
  to?: string | string[]
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<ContributionsSearchParams>
}): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = Object.values(params).some((value) => firstValue(value).trim())

  return {
    alternates: { canonical: '/contributions' },
    description: pageDescription,
    openGraph: {
      description: pageDescription,
      title: pageTitle,
      type: 'website',
      url: '/contributions',
    },
    ...(hasFilters ? { robots: nonIndexableRobots } : {}),
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
  searchParams: Promise<ContributionsSearchParams>
}) {
  const params = await searchParams
  const contributions = await getVisibleContributions()
  const legacyFilter = firstValue(params.filter).trim().toLowerCase()
  const requestedStatus = firstValue(params.status).trim().toLowerCase()
  const requestedRepository = firstValue(params.repo).trim().toLowerCase()
  const requestedTag = firstValue(params.tag).trim().toLowerCase()
  const requestedSort = firstValue(params.sort).trim().toLowerCase()
  const requestedPage = Number.parseInt(firstValue(params.page), 10)
  const requestedQuery = firstValue(params.q).trim()
  const requestedRange = normalizeRange(firstValue(params.range))
  const requestedFrom = firstValue(params.from).trim()
  const requestedTo = firstValue(params.to).trim()

  const knownRepositories = new Set(
    contributions.map((item) => `${item.organization}/${item.repository}`.toLowerCase()),
  )
  const knownTags = new Set(
    contributions.flatMap((contribution) =>
      (contribution.tags || []).map((tag) => tag.slug.toLowerCase()),
    ),
  )

  const status = ['merged', 'open'].includes(requestedStatus)
    ? requestedStatus
    : ['merged', 'open'].includes(legacyFilter)
      ? legacyFilter
      : ''
  const tag = knownTags.has(requestedTag)
    ? requestedTag
    : knownTags.has(legacyFilter)
      ? legacyFilter
      : ''
  const sort: ContributionSort = contributionSorts.has(requestedSort as ContributionSort)
    ? (requestedSort as ContributionSort)
    : 'newest'
  const range: DateRangePreset =
    requestedRange || (requestedFrom || requestedTo ? 'custom' : '')

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    author: { '@type': 'Person', name: siteName, url: absoluteURL('/') },
    description: pageDescription,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: contributions.map((contribution, index) => ({
        '@type': 'ListItem',
        item: {
          '@type': 'CreativeWork',
          description: contribution.portfolioSummary || contribution.title,
          name: contribution.title,
          url: contribution.prUrl,
        },
        position: index + 1,
      })),
      numberOfItems: contributions.length,
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

          <ContributionsTable
            contributions={contributions}
            initialFilters={{
              from: requestedFrom,
              page: Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1,
              query: requestedQuery,
              range,
              repository: knownRepositories.has(requestedRepository) ? requestedRepository : '',
              sort,
              status,
              tag,
              to: requestedTo,
            }}
          />
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
