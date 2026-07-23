import { Rss } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { BlogSearch } from '@/components/blog-search'
import { BlogIssueRow } from '@/components/blog/blog-issue-row'
import { FilterSelect } from '@/components/filter-select'
import { Button } from '@/components/ui/button'
import { getBlogIndex } from '@/lib/blog-data'
import { blogHref } from '@/lib/blog-url'
import { absoluteURL, nonIndexableRobots, serializeJsonLd } from '@/lib/seo'

export const revalidate = 300

const pageTitle = 'Backend Engineering Blog'
const pageDescription =
  'Practical backend engineering articles by Soumajit Ghosh about APIs, distributed systems, databases, cloud infrastructure, reliability, and developer tooling.'

type BlogSearchParams = {
  label?: string | string[]
  page?: string | string[]
  q?: string | string[]
}

const firstValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] || '' : value || ''

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>
}): Promise<Metadata> {
  const params = await searchParams
  const page = Number.parseInt(firstValue(params.page) || '1', 10)
  const hasFilters = Boolean(
    firstValue(params.q).trim() ||
    firstValue(params.label).trim() ||
    (Number.isFinite(page) && page > 1),
  )

  return {
    alternates: {
      canonical: '/blogs',
      types: { 'application/rss+xml': '/rss.xml' },
    },
    description: pageDescription,
    openGraph: {
      description: pageDescription,
      title: pageTitle,
      type: 'website',
      url: '/blogs',
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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<BlogSearchParams>
}) {
  const params = await searchParams
  const query = firstValue(params.q).trim()
  const label = firstValue(params.label).trim().toLowerCase()
  const parsedPage = Number.parseInt(firstValue(params.page) || '1', 10)
  const requestedPage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const result = await getBlogIndex(query, label, requestedPage)
  const labelExists = !label || result.labels.includes(label)
  const hasFilters = Boolean(query || label)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    author: {
      '@id': `${absoluteURL('/')}#person`,
      '@type': 'Person',
      name: 'Soumajit Ghosh',
      url: absoluteURL('/'),
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          item: absoluteURL('/'),
          name: 'Home',
          position: 1,
        },
        {
          '@type': 'ListItem',
          item: absoluteURL('/blogs'),
          name: 'Backend Engineering Blog',
          position: 2,
        },
      ],
    },
    description: pageDescription,
    mainEntity: {
      '@type': 'Blog',
      blogPost: result.docs.map((post) => ({
        '@type': 'BlogPosting',
        dateModified: post.updatedAt,
        datePublished: post.publishedAt,
        description: post.excerpt || post.title,
        headline: post.title,
        url: absoluteURL(`/blogs/${post.slug}`),
      })),
      name: pageTitle,
      url: absoluteURL('/blogs'),
    },
    name: pageTitle,
    url: absoluteURL('/blogs'),
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <main className="page-container py-10 sm:py-12 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-xs text-terminal-green sm:text-sm">
              soumajit@portfolio:<span className="text-terminal-blue">~</span>$ ls ./blogs
            </p>
            <h1 className="page-title mt-4 font-semibold">Backend engineering blog</h1>
            <p className="page-lede mt-3 max-w-2xl text-muted-foreground sm:mt-4">
              Practical articles on reliable APIs, distributed systems, databases, cloud
              infrastructure, and lessons learned in production.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/rss.xml">
              <Rss aria-hidden="true" />
              ./rss
            </Link>
          </Button>
        </div>

        <section aria-labelledby="blog-index-heading" className="mt-8">
          <h2 className="sr-only" id="blog-index-heading">
            Blog issue index
          </h2>
          <div className="rounded-lg border border-border bg-card/40 p-3 sm:p-5">
            <BlogSearch initialQuery={query} />
            {result.labels.length ? (
              <div className="mt-3 sm:mt-4">
                <FilterSelect
                  accessibleLabel="Filter blog posts by label"
                  allLabel="All labels"
                  name="label"
                  options={result.labels.map((item) => ({ label: item, value: item }))}
                  value={labelExists ? label : ''}
                />
              </div>
            ) : null}
          </div>

          <div
            aria-live="polite"
            className="mt-5 flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted-foreground"
          >
            <span>
              {result.totalDocs} {result.totalDocs === 1 ? 'issue' : 'issues'}
              {query ? ` matched \"${query}\"` : ' published'}
            </span>
            {result.totalPages > 1 ? (
              <span>
                page {result.page}/{result.totalPages}
              </span>
            ) : null}
          </div>

          <div className="mt-5">
            {!labelExists ? (
              <BlogEmptyState>
                <p className="text-terminal-red">error: unknown label &quot;{label}&quot;</p>
                <Link className="mt-2 inline-block text-primary hover:underline" href="/blogs">
                  retry with ./blogs
                </Link>
              </BlogEmptyState>
            ) : !result.requestedPageIsValid ? (
              <BlogEmptyState>
                <p className="text-terminal-red">
                  error: page {result.page} is outside the issue index
                </p>
                <Link
                  className="mt-2 inline-block text-primary hover:underline"
                  href={blogHref({ label, query })}
                >
                  return to page 1
                </Link>
              </BlogEmptyState>
            ) : result.docs.length ? (
              <div className="grid gap-5" role="list">
                {result.docs.map((post) => (
                  <BlogIssueRow key={post.id} post={post} query={query} />
                ))}
              </div>
            ) : (
              <BlogEmptyState>
                {hasFilters ? (
                  <>
                    <p>0 issues matched {query ? `\"${query}\"` : `label:${label}`}</p>
                    <p className="mt-2 text-muted-foreground">
                      Try another term or clear the active labels.
                    </p>
                    <Link className="mt-3 inline-block text-primary hover:underline" href="/blogs">
                      ./clear-filters
                    </Link>
                  </>
                ) : (
                  <>
                    <p>$ ls ./blogs</p>
                    <p className="mt-2 text-muted-foreground">directory is currently empty</p>
                  </>
                )}
              </BlogEmptyState>
            )}
          </div>

          {result.requestedPageIsValid && result.totalPages > 1 ? (
            <nav
              aria-label="Blog pagination"
              className="mt-6 flex items-center justify-between gap-4"
            >
              {result.hasPrevPage ? (
                <Button asChild variant="outline">
                  <Link href={blogHref({ label, page: result.page - 1, query })}>./previous</Link>
                </Button>
              ) : (
                <Button aria-disabled="true" disabled variant="outline">
                  ./previous
                </Button>
              )}
              {result.hasNextPage ? (
                <Button asChild variant="outline">
                  <Link href={blogHref({ label, page: result.page + 1, query })}>./next</Link>
                </Button>
              ) : (
                <Button aria-disabled="true" disabled variant="outline">
                  ./next
                </Button>
              )}
            </nav>
          ) : null}
        </section>
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
          type="application/ld+json"
        />
      </main>
    </div>
  )
}

function BlogEmptyState({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-10 text-center font-mono text-sm sm:p-10">{children}</div>
}
