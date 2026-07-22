import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CopyLinkButton } from '@/components/copy-link-button'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { BlogPostBody } from '@/components/rich-text'
import { StarButton } from '@/components/star-button'
import { Badge } from '@/components/ui/badge'
import { formatBlogDate, wasMeaningfullyUpdated } from '@/lib/blog-content'
import { getBlogNeighbors, getPublishedBlogPost } from '@/lib/blog-data'
import { extractRichTextHeadings } from '@/lib/rich-text-headings'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedBlogPost(slug)
  if (!post) return { title: 'soumajit in ~/404' }

  const title = post.seo?.title || `soumajit in ~/blogs/${post.slug}`
  const description = post.seo?.description || post.excerpt || post.title

  return {
    alternates: { canonical: `/blogs/${post.slug}` },
    description,
    openGraph: {
      description,
      modifiedTime: post.updatedAt,
      publishedTime: post.publishedAt || undefined,
      tags: post.labels?.map((label) => label.name),
      title,
      type: 'article',
      url: `/blogs/${post.slug}`,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      title,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPublishedBlogPost(slug)
  if (!post) notFound()

  const { newer, older } = await getBlogNeighbors(post.id)
  const headings = extractRichTextHeadings(post.body)
  const showUpdated = wasMeaningfullyUpdated(post.publishedAt, post.updatedAt)
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const canonicalURL = `${siteURL}/blogs/${post.slug}`
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    author: {
      '@type': 'Person',
      name: 'Soumajit Ghosh',
      url: siteURL,
    },
    dateModified: post.updatedAt,
    datePublished: post.publishedAt,
    description: post.excerpt || post.title,
    headline: post.title,
    keywords: post.labels?.map((label) => label.name).join(', '),
    mainEntityOfPage: canonicalURL,
    url: canonicalURL,
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <main className="page-container py-8 sm:py-10 md:py-14">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 font-mono text-[0.6875rem] leading-5 text-muted-foreground sm:text-sm"
        >
          <Link className="hover:text-primary" href="/blogs">
            ~/blogs
          </Link>
          <span>/</span>
          <span className="text-terminal-cyan">#{post.issueNumber}</span>
        </nav>

        <article>
          <header className="mt-6 border-b border-border pb-8">
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0 max-w-4xl">
                <p className="font-mono text-xs text-terminal-green sm:text-sm">
                  $ cat issue-{post.issueNumber}.md
                </p>
                <h1 className="detail-title mt-4 break-words font-semibold sm:mt-5">
                  {post.title}{' '}
                  <span className="whitespace-nowrap text-muted-foreground">
                    #{post.issueNumber}
                  </span>
                </h1>
                {post.excerpt ? (
                  <p className="detail-lede mt-4 max-w-3xl text-muted-foreground sm:mt-5 lg:text-lg">
                    {post.excerpt}
                  </p>
                ) : null}
              </div>
              <div className="flex min-w-0 flex-wrap items-start gap-3 lg:justify-end">
                <CopyLinkButton />
                <StarButton resource="blog" slug={post.slug} />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.6875rem] text-muted-foreground sm:mt-6 sm:gap-y-3 sm:text-xs">
              <span>published {formatBlogDate(post.publishedAt)}</span>
              {showUpdated ? <span>updated {formatBlogDate(post.updatedAt)}</span> : null}
              <span className="inline-flex items-center gap-1.5">
                <Clock3 aria-hidden="true" className="size-3.5" />
                {post.readingMinutes} min read
              </span>
            </div>

            {post.labels?.length ? (
              <div className="mt-5 flex flex-wrap gap-2" aria-label="Article labels">
                {post.labels.map((label) => (
                  <Badge
                    asChild
                    className="min-h-9 px-2 text-[0.6875rem] sm:min-h-0 sm:text-xs"
                    key={label.id || label.name}
                    variant="outline"
                  >
                    <Link href={`/blogs?label=${encodeURIComponent(label.name)}`}>
                      {label.name}
                    </Link>
                  </Badge>
                ))}
              </div>
            ) : null}
          </header>

          <TableOfContents headings={headings} />

          <div className="mt-10 w-full">
            <BlogPostBody data={post.body} />
          </div>

          <footer className="mt-14 border-t border-border pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-muted-foreground">
              <span>
                issue #{post.issueNumber} · published {formatBlogDate(post.publishedAt)}
              </span>
              <Link className="text-primary hover:underline" href="/blogs">
                ./all-posts
              </Link>
            </div>

            {(newer || older) && (
              <nav
                aria-label="Previous and next articles"
                className="mt-8 grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
              >
                {newer ? (
                  <Link
                    className="rounded-lg border border-border p-4 transition-colors hover:border-primary/60 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={`/blogs/${newer.slug}`}
                  >
                    <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      <ArrowLeft aria-hidden="true" className="size-4" /> newer
                    </span>
                    <span className="mt-2 block font-mono text-sm text-foreground">
                      #{newer.issueNumber} {newer.title}
                    </span>
                  </Link>
                ) : (
                  <span />
                )}
                {older ? (
                  <Link
                    className="rounded-lg border border-border p-4 text-right transition-colors hover:border-primary/60 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={`/blogs/${older.slug}`}
                  >
                    <span className="flex items-center justify-end gap-2 font-mono text-xs text-muted-foreground">
                      older <ArrowRight aria-hidden="true" className="size-4" />
                    </span>
                    <span className="mt-2 block font-mono text-sm text-foreground">
                      #{older.issueNumber} {older.title}
                    </span>
                  </Link>
                ) : null}
              </nav>
            )}
          </footer>
        </article>

        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
          type="application/ld+json"
        />
      </main>
    </div>
  )
}
