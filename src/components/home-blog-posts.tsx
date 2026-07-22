import { ArrowUpRight, CircleDot } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { HomeBlogPost } from '@/lib/portfolio-data'

function formatDate(value?: null | string) {
  if (!value) return 'unpublished'
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(value))
}

export function HomeBlogPosts({ posts }: { posts: HomeBlogPost[] }) {
  if (!posts.length) {
    return (
      <div className="grid h-full place-items-center rounded-lg border border-dashed border-border px-6 text-center font-mono text-sm text-muted-foreground">
        <p>
          <span className="text-terminal-yellow">warning:</span> no published blog posts yet
        </p>
      </div>
    )
  }

  return (
    <div
      aria-label="Featured blog posts"
      className="scrollbar-thin flex h-full snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 pr-[12vw] md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:pr-0"
      role="list"
    >
      {posts.slice(0, 3).map((post) => (
        <Card
          className="group h-full w-[min(82vw,22rem)] shrink-0 snap-start gap-4 p-5 transition-colors hover:border-terminal-blue/60 hover:bg-accent/20 focus-within:border-terminal-blue/60 md:w-auto"
          key={post.id}
          role="listitem"
        >
          <div className="flex items-center justify-between gap-3 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 text-terminal-green">
              <CircleDot aria-hidden="true" className="size-4" />#{post.issueNumber}
            </span>
            <span>{post.readingMinutes} min read</span>
          </div>
          <div className="min-w-0">
            <h2 className="font-mono text-base font-semibold tracking-[-0.025em] sm:text-lg">
              <Link
                className="rounded-sm outline-none group-hover:text-terminal-blue focus-visible:ring-2 focus-visible:ring-ring"
                href={`/blog/${post.slug}`}
              >
                {post.title}
              </Link>
            </h2>
            {post.excerpt ? (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {post.excerpt}
              </p>
            ) : null}
          </div>
          {post.labels?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {post.labels.slice(0, 3).map((label) => (
                <Badge className="text-[10px]" key={label.id || label.name} variant="outline">
                  {label.name}
                </Badge>
              ))}
            </div>
          ) : null}
          <div className="mt-auto flex items-center justify-between gap-3 font-mono text-[11px] text-muted-foreground">
            <time dateTime={post.publishedAt || undefined}>{formatDate(post.publishedAt)}</time>
            <span className="inline-flex items-center gap-1 text-terminal-cyan">
              ./read <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}
