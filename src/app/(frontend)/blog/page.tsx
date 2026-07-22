import { CircleDot, Rss } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { BlogSearch } from '@/components/blog-search'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBlogDate } from '@/lib/blog-content'
import { getBlogIndex, type BlogPostListItem } from '@/lib/blog-data'
import { cn } from '@/lib/utils'

export const revalidate = 300

export const metadata: Metadata = {
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': '/rss.xml' },
  },
  description: 'output: notes on backend systems, infrastructure, and developer tooling.',
  openGraph: {
    description: 'output: notes on backend systems, infrastructure, and developer tooling.',
    title: 'soumajit in ~/blog',
    type: 'website',
    url: '/blog',
  },
  title: 'soumajit in ~/blog',
}

type BlogSearchParams = {
  label?: string | string[]
  page?: string | string[]
  q?: string | string[]
}

const firstValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] || '' : value || ''

const blogHref = ({ label, page, query }: { label?: string; page?: number; query?: string }) => {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (label) params.set('label', label)
  if (page && page > 1) params.set('page', String(page))
  return params.size ? `/blog?${params.toString()}` : '/blog'
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

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-sm text-terminal-green">
              soumajit@portfolio:<span className="text-terminal-blue">~</span>$ ls ./blog
            </p>
            <h1 className="mt-4 text-3xl font-semibold md:text-5xl">Published issues</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Engineering notes on reliable systems, practical tooling, and lessons learned in
              production.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/rss.xml">
              <Rss aria-hidden="true" />
              ./rss
            </Link>
          </Button>
        </div>

        <section aria-labelledby="blog-index-heading" className="mt-10">
          <h2 className="sr-only" id="blog-index-heading">
            Blog issue index
          </h2>
          <div className="rounded-lg border border-border bg-card/40">
            <div className="border-b border-border p-4 sm:p-5">
              <BlogSearch initialQuery={query} />
              {result.labels.length ? (
                <nav
                  aria-label="Filter blog posts by label"
                  className="scrollbar-thin mt-4 flex gap-2 overflow-x-auto pb-1"
                >
                  <Badge
                    asChild
                    className={cn('shrink-0', !label && 'border-primary text-primary')}
                    variant="outline"
                  >
                    <Link href={blogHref({ query })}>all</Link>
                  </Badge>
                  {result.labels.map((item) => (
                    <Badge
                      asChild
                      className={cn('shrink-0', label === item && 'border-primary text-primary')}
                      key={item}
                      variant="outline"
                    >
                      <Link href={blogHref({ label: item, query })}>{item}</Link>
                    </Badge>
                  ))}
                </nav>
              ) : null}
            </div>

            <div
              aria-live="polite"
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 font-mono text-xs text-muted-foreground sm:px-5"
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

            {!labelExists ? (
              <BlogEmptyState>
                <p className="text-terminal-red">error: unknown label &quot;{label}&quot;</p>
                <Link className="mt-2 inline-block text-primary hover:underline" href="/blog">
                  retry with ./blog
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
              <div role="list">
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
                    <Link className="mt-3 inline-block text-primary hover:underline" href="/blog">
                      ./clear-filters
                    </Link>
                  </>
                ) : (
                  <>
                    <p>$ ls ./blog</p>
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
      </main>
    </div>
  )
}

function BlogIssueRow({ post, query }: { post: BlogPostListItem; query: string }) {
  return (
    <article
      className="group grid gap-3 border-b border-border px-4 py-5 last:border-b-0 hover:bg-accent/30 focus-within:bg-accent/30 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-5"
      role="listitem"
    >
      <CircleDot
        aria-label="Published issue"
        className="mt-1 size-5 text-terminal-green"
        role="img"
      />
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-[-0.025em] sm:text-lg">
          <Link
            className="rounded-sm text-foreground outline-none group-hover:text-terminal-blue focus-visible:ring-2 focus-visible:ring-ring"
            href={`/blog/${post.slug}`}
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          #{post.issueNumber} · published {formatBlogDate(post.publishedAt)} · {post.readingMinutes}{' '}
          min read
        </p>
        {post.excerpt ? (
          <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}
      </div>
      {post.labels?.length ? (
        <div className="flex flex-wrap items-start gap-2 sm:max-w-64 sm:justify-end">
          {post.labels.map((label) => (
            <Badge asChild key={label.id || label.name} variant="outline">
              <Link href={blogHref({ label: label.name, query })}>{label.name}</Link>
            </Badge>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function BlogEmptyState({ children }: { children: React.ReactNode }) {
  return <div className="p-10 text-center font-mono text-sm">{children}</div>
}
