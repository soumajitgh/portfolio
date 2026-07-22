import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CopyLinkButton } from '@/components/copy-link-button'
import { BlogPostBody } from '@/components/rich-text'
import { SiteHeader } from '@/components/site-header'
import { StarButton } from '@/components/star-button'
import { Badge } from '@/components/ui/badge'
import { formatBlogDate, wasMeaningfullyUpdated } from '@/lib/blog-content'
import { getBlogNeighbors, getPublishedBlogPost, resolveBlogImage } from '@/lib/blog-data'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedBlogPost(slug)
  if (!post) return { title: 'soumajit in ~/404' }

  const seoImage = resolveBlogImage(post.seo)
  const title = post.seo?.title || `soumajit in ~/blog/${post.slug}`
  const description = post.seo?.description || post.excerpt || post.title
  const image = seoImage?.url
    ? { alt: seoImage.alt, url: seoImage.url }
    : {
        alt: `${post.title}, issue #${post.issueNumber}`,
        url: `/blog/${post.slug}/opengraph-image`,
      }

  return {
    alternates: { canonical: `/blog/${post.slug}` },
    description,
    openGraph: {
      description,
      images: [image],
      modifiedTime: post.updatedAt,
      publishedTime: post.publishedAt || undefined,
      tags: post.labels?.map((label) => label.name),
      title,
      type: 'article',
      url: `/blog/${post.slug}`,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: [image.url],
      title,
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPublishedBlogPost(slug)
  if (!post) notFound()

  const { newer, older } = await getBlogNeighbors(post.id)
  const showUpdated = wasMeaningfullyUpdated(post.publishedAt, post.updatedAt)
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const canonicalURL = `${siteURL}/blog/${post.slug}`
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
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted-foreground sm:text-sm">
          <Link className="hover:text-primary" href="/blog">
            ~/blog
          </Link>
          <span>/</span>
          <span className="text-terminal-cyan">#{post.issueNumber}</span>
        </nav>

        <article>
          <header className="mt-6 border-b border-border pb-8">
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0 max-w-4xl">
                <p className="font-mono text-sm text-terminal-green">
                  $ cat issue-{post.issueNumber}.md
                </p>
                <h1 className="mt-5 text-3xl font-semibold leading-tight md:text-5xl">
                  {post.title}{' '}
                  <span className="whitespace-nowrap text-muted-foreground">
                    #{post.issueNumber}
                  </span>
                </h1>
                {post.excerpt ? (
                  <p className="mt-5 max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                    {post.excerpt}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-start gap-3 lg:justify-end">
                <CopyLinkButton />
                <StarButton resource="blog" slug={post.slug} />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 font-mono text-xs text-muted-foreground">
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
                  <Badge asChild key={label.id || label.name} variant="outline">
                    <Link href={`/blog?label=${encodeURIComponent(label.name)}`}>{label.name}</Link>
                  </Badge>
                ))}
              </div>
            ) : null}
          </header>

          <div className="mt-10 w-full">
            <BlogPostBody data={post.body} />
          </div>

          <footer className="mt-14 border-t border-border pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-muted-foreground">
              <span>
                issue #{post.issueNumber} · published {formatBlogDate(post.publishedAt)}
              </span>
              <Link className="text-primary hover:underline" href="/blog">
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
                    href={`/blog/${newer.slug}`}
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
                    href={`/blog/${older.slug}`}
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
