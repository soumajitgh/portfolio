import { CircleDot } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { formatBlogDate } from '@/lib/blog-content'
import type { BlogPostListItem } from '@/lib/blog-data'
import { blogHref } from '@/lib/blog-url'

export function BlogIssueRow({ post, query }: { post: BlogPostListItem; query: string }) {
  return (
    <article
      className="group relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-lg border border-border/80 bg-card px-4 py-5 transition-colors hover:border-primary/55 hover:bg-accent/25 focus-within:border-primary/55 focus-within:bg-accent/25 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-3 sm:px-6 sm:py-6"
      role="listitem"
    >
      <CircleDot
        aria-label="Published issue"
        className="mt-1 size-4 text-terminal-green sm:size-5"
        role="img"
      />
      <div className="min-w-0">
        <h2 className="break-words text-sm font-semibold tracking-[-0.025em] sm:text-lg">
          <Link
            className="rounded-sm text-foreground after:absolute after:inset-0 outline-none group-hover:text-terminal-blue focus-visible:ring-2 focus-visible:ring-ring"
            href={`/blogs/${post.slug}`}
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-1 font-mono text-[0.6875rem] leading-4 text-muted-foreground sm:text-xs sm:leading-5">
          #{post.issueNumber} · published {formatBlogDate(post.publishedAt)} · {post.readingMinutes}{' '}
          min read
        </p>
        {post.excerpt ? (
          <p className="mt-2 line-clamp-3 max-w-3xl text-[0.8125rem] leading-5 text-muted-foreground sm:mt-3 sm:line-clamp-2 sm:text-sm sm:leading-6">
            {post.excerpt}
          </p>
        ) : null}
      </div>
      {post.labels?.length ? (
        <div className="relative z-10 col-start-2 flex min-w-0 flex-wrap items-start gap-2 sm:col-start-auto sm:max-w-64 sm:justify-end">
          {post.labels.map((label) => (
            <Badge
              asChild
              className="min-h-9 px-2 text-[0.6875rem] sm:min-h-0 sm:text-xs"
              key={label.id || label.name}
              variant="outline"
            >
              <Link href={blogHref({ label: label.name, query })}>{label.name}</Link>
            </Badge>
          ))}
        </div>
      ) : null}
    </article>
  )
}
