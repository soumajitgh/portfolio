import { CircleDot } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { formatBlogDate } from '@/lib/blog-content'
import type { BlogPostListItem } from '@/lib/blog-data'
import { blogHref } from '@/lib/blog-url'

export function BlogIssueRow({ post, query }: { post: BlogPostListItem; query: string }) {
  return (
    <article
      className="group relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 border-b border-border px-4 py-5 last:border-b-0 hover:bg-accent/30 focus-within:bg-accent/30 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-3 sm:px-5"
      role="listitem"
    >
      <CircleDot
        aria-label="Published issue"
        className="mt-1 size-5 text-terminal-green"
        role="img"
      />
      <div className="min-w-0">
        <h2 className="break-words text-[0.9375rem] font-semibold tracking-[-0.025em] sm:text-lg">
          <Link
            className="rounded-sm text-foreground after:absolute after:inset-0 outline-none group-hover:text-terminal-blue focus-visible:ring-2 focus-visible:ring-ring"
            href={`/blog/${post.slug}`}
          >
            {post.title}
          </Link>
        </h2>
        <p className="mt-1 font-mono text-xs leading-5 text-muted-foreground">
          #{post.issueNumber} · published {formatBlogDate(post.publishedAt)} · {post.readingMinutes}{' '}
          min read
        </p>
        {post.excerpt ? (
          <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:line-clamp-2">
            {post.excerpt}
          </p>
        ) : null}
      </div>
      {post.labels?.length ? (
        <div className="relative z-10 col-start-2 flex min-w-0 flex-wrap items-start gap-2 sm:col-start-auto sm:max-w-64 sm:justify-end">
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
