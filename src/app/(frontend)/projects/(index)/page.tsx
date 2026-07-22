import type { Metadata } from 'next'
import Link from 'next/link'

import { ProjectCard } from '@/components/project-card'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { getPublishedProjects } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

export const revalidate = 300

export const metadata: Metadata = {
  alternates: { canonical: '/projects' },
  description: 'Published backend, infrastructure, and developer tooling projects by Soumajit.',
  openGraph: {
    description: 'Published backend, infrastructure, and developer tooling projects by Soumajit.',
    title: 'Projects — Soumajit',
    type: 'website',
    url: '/projects',
  },
  title: 'Projects — Soumajit',
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>
}) {
  const { topic } = await searchParams
  const projects = await getPublishedProjects()
  const topics = Array.from(
    new Map(
      projects.flatMap((project) => project.topics || []).map((item) => [item.slug, item]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name))
  const topicExists = !topic || topics.some((item) => item.slug === topic)
  const visibleProjects = topic
    ? projects.filter((project) => project.topics?.some((item) => item.slug === topic))
    : projects

  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10 md:py-16">
        <p className="font-mono text-sm text-terminal-green">
          soumajit@portfolio:<span className="text-terminal-blue">~</span>$ ls ./projects
        </p>
        <h1 className="mt-4 text-3xl font-semibold md:text-5xl">Published projects</h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-muted-foreground">
            Backend systems, infrastructure, open-source work, and developer tools.
          </p>
          <span className="font-mono text-sm text-terminal-yellow">
            {visibleProjects.length} {visibleProjects.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <nav aria-label="Filter projects by topic" className="mt-8 flex flex-wrap gap-2">
          <Badge asChild className={cn(!topic && 'border-primary text-primary')} variant="outline">
            <Link href="/projects">All</Link>
          </Badge>
          {topics.map((item) => (
            <Badge
              asChild
              className={cn(topic === item.slug && 'border-primary text-primary')}
              key={item.slug}
              variant="outline"
            >
              <Link href={`/projects?topic=${item.slug}`}>{item.name}</Link>
            </Badge>
          ))}
        </nav>

        {!topicExists ? (
          <div className="mt-10 rounded-lg border border-destructive/40 bg-card p-6 font-mono text-sm">
            <p className="text-terminal-red">error: unknown topic &quot;{topic}&quot;</p>
            <Link className="mt-2 inline-block text-primary hover:underline" href="/projects">
              retry with ./projects
            </Link>
          </div>
        ) : visibleProjects.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {visibleProjects.map((project, index) => (
              <ProjectCard index={index} key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-lg border border-dashed border-border p-10 text-center font-mono text-sm text-muted-foreground">
            output: no published projects found
          </div>
        )}
      </main>
    </div>
  )
}
