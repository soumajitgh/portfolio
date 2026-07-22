import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Project } from '@/payload-types'

export function ProjectDetailSidebar({ links, topics }: Pick<Project, 'links' | 'topics'>) {
  return (
    <aside
      aria-label="Project details"
      className="order-first border-b border-border pb-8 lg:order-none lg:sticky lg:top-24 lg:border-b-0 lg:border-l lg:pb-0 lg:pl-7"
    >
      <section aria-labelledby="project-stack-heading">
        <h2 className="font-mono text-sm font-medium text-terminal-cyan" id="project-stack-heading">
          const stack = [
        </h2>
        {topics?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <Badge
                asChild
                className="min-h-9 px-2 text-[0.6875rem] text-terminal-purple sm:min-h-0 sm:text-xs"
                key={topic.slug}
                variant="outline"
              >
                <Link href={`/projects?topic=${topic.slug}`}>{topic.name}</Link>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="mt-3 font-mono text-xs text-muted-foreground">{'// no topics'}</p>
        )}
        <p className="mt-3 font-mono text-sm text-terminal-cyan">]</p>
      </section>

      <section aria-labelledby="project-links-heading" className="mt-7 border-t border-border pt-7">
        <h2
          className="font-mono text-sm font-medium text-terminal-green"
          id="project-links-heading"
        >
          ./links
        </h2>
        {links?.length ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {links.map((link) => {
              const external = /^https?:\/\//.test(link.url)
              return (
                <Button
                  asChild
                  className="w-full justify-between"
                  key={link.id || link.url}
                  variant="outline"
                >
                  <a
                    href={link.url}
                    rel={external ? 'noopener noreferrer' : undefined}
                    target={external ? '_blank' : undefined}
                  >
                    <span className="min-w-0 truncate">
                      ./{link.label.toLowerCase().replaceAll(' ', '-')}
                    </span>
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                </Button>
              )
            })}
          </div>
        ) : (
          <p className="mt-3 font-mono text-xs text-muted-foreground">output: no external links</p>
        )}
      </section>
    </aside>
  )
}
