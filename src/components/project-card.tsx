import { ArrowUpRight, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatLabel } from '@/lib/content'
import type { ProjectCardData } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

const accentClasses = {
  blue: 'text-terminal-blue',
  cyan: 'text-terminal-cyan',
  green: 'text-terminal-green',
  purple: 'text-terminal-purple',
  yellow: 'text-terminal-yellow',
} as const

export function ProjectCard({
  index,
  project,
  compact = false,
}: {
  compact?: boolean
  index: number
  project: ProjectCardData
}) {
  return (
    <Card
      className={cn(
        'group relative h-full overflow-hidden transition-colors hover:border-primary/55 hover:bg-accent/25',
        compact && 'w-full min-w-0 max-w-none gap-4 py-4',
      )}
    >
      {project.coverImage?.url && !compact && (
        <div className="relative mx-5 aspect-[16/8] overflow-hidden rounded-md border border-border/70 bg-muted">
          <Image
            alt={project.coverImage.alt}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.015] motion-reduce:transition-none"
            fill
            sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2.5rem), 34rem"
            src={project.coverImage.url}
          />
        </div>
      )}
      <CardHeader className={compact ? 'px-4 sm:px-5' : undefined}>
        <div className="mb-2 flex items-center justify-between gap-4 font-mono text-[11px] text-terminal-yellow">
          <span>
            {String(index + 1).padStart(2, '0')} / {formatLabel(project.category).toUpperCase()}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-terminal-green" aria-hidden="true" />
            {formatLabel(project.status)}
          </span>
        </div>
        <CardTitle>
          <Link
            className="after:absolute after:inset-0 focus-visible:outline-none"
            href={`/projects/${project.slug}`}
          >
            {project.title}
            <ArrowUpRight
              className="ml-2 inline size-4 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
          </Link>
        </CardTitle>
        <CardDescription className={compact ? 'line-clamp-2' : 'line-clamp-3'}>
          {project.shortDescription}
        </CardDescription>
      </CardHeader>
      <CardContent
        className={cn(
          'mt-auto flex flex-wrap items-center gap-2',
          compact && 'gap-1.5 px-4 sm:px-5',
        )}
      >
        {project.topics?.slice(0, compact ? 3 : undefined).map((topic) => (
          <Badge
            asChild
            className={cn(
              'relative z-10',
              accentClasses[project.accent || 'blue'],
              compact && 'min-h-9 max-w-full truncate px-2 md:min-h-0',
            )}
            key={topic.slug}
            variant="outline"
          >
            <Link href={`/projects?topic=${topic.slug}`}>{topic.name}</Link>
          </Badge>
        ))}
        <span className="ml-auto flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <Star className="size-3.5" aria-hidden="true" /> {project.starCount}
        </span>
        {project.projectYear && (
          <span className="font-mono text-xs text-terminal-orange">{project.projectYear}</span>
        )}
      </CardContent>
    </Card>
  )
}
