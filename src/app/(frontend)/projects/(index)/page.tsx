import type { Metadata } from 'next'
import Link from 'next/link'

import { ProjectCard } from '@/components/project-card'
import { ProjectSearch } from '@/components/projects/project-search'
import { Badge } from '@/components/ui/badge'
import { getPublishedProjects } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

export const revalidate = 300

export const metadata: Metadata = {
  alternates: { canonical: '/projects' },
  description: 'output: published backend, infrastructure, and developer tooling projects.',
  openGraph: {
    description: 'output: published backend, infrastructure, and developer tooling projects.',
    title: 'soumajit in ~/projects',
    type: 'website',
    url: '/projects',
  },
  title: 'soumajit in ~/projects',
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; topic?: string | string[] }>
}) {
  const params = await searchParams
  const query = firstValue(params.q).trim()
  const normalizedQuery = query.toLowerCase()
  const topic = firstValue(params.topic).trim().toLowerCase()
  const projects = await getPublishedProjects()
  const topics = Array.from(
    new Map(
      projects.flatMap((project) => project.topics || []).map((item) => [item.slug, item]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name))
  const topicExists = !topic || topics.some((item) => item.slug === topic)
  const visibleProjects = projects.filter((project) => {
    const matchesTopic = !topic || project.topics?.some((item) => item.slug === topic)
    if (!matchesTopic || !normalizedQuery) return Boolean(matchesTopic)

    const searchableText = [
      project.title,
      project.shortDescription,
      project.category,
      project.category.replaceAll('-', ' '),
      project.status,
      project.projectYear,
      ...(project.topics || []).flatMap((item) => [item.name, item.slug]),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchableText.includes(normalizedQuery)
  })

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <main className="page-container py-10 sm:py-12 md:py-16">
        <p className="font-mono text-sm text-terminal-green">
          soumajit@portfolio:<span className="text-terminal-blue">~</span>$ ls ./projects
        </p>
        <h1 className="page-title mt-4 font-semibold">Published projects</h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="page-lede max-w-2xl text-muted-foreground">
            Backend systems, infrastructure, open-source work, and developer tools.
          </p>
          <span aria-live="polite" className="font-mono text-sm text-terminal-yellow">
            {visibleProjects.length} {visibleProjects.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <section
          aria-label="Search and filter projects"
          className="mt-8 rounded-lg border border-border bg-card/40 p-4 sm:p-5"
        >
          <ProjectSearch initialQuery={query} />
          {topics.length ? (
            <nav
              aria-label="Filter projects by topic"
              className="scrollbar-thin -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
            >
              <Badge
                asChild
                className={cn(!topic && 'border-primary text-primary')}
                variant="outline"
              >
                <Link href={projectsHref({ query })}>All</Link>
              </Badge>
              {topics.map((item) => (
                <Badge
                  asChild
                  className={cn(topic === item.slug && 'border-primary text-primary')}
                  key={item.slug}
                  variant="outline"
                >
                  <Link href={projectsHref({ query, topic: item.slug })}>{item.name}</Link>
                </Badge>
              ))}
            </nav>
          ) : null}
        </section>

        {!topicExists ? (
          <div className="mt-10 rounded-lg border border-destructive/40 bg-card p-6 font-mono text-sm">
            <p className="text-terminal-red">error: unknown topic &quot;{topic}&quot;</p>
            <Link
              className="mt-2 inline-block text-primary hover:underline"
              href={projectsHref({ query })}
            >
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
          <div className="mt-10 rounded-lg border border-dashed border-border px-4 py-10 text-center font-mono text-sm text-muted-foreground sm:p-10">
            {query ? (
              <>
                <p>0 projects matched &quot;{query}&quot;</p>
                <p className="mt-2">Try another term or clear the active topic.</p>
                <Link
                  className="mt-3 inline-block text-primary hover:underline"
                  href={projectsHref({ topic })}
                >
                  ./clear-search
                </Link>
              </>
            ) : (
              'output: no published projects found'
            )}
          </div>
        )}
      </main>
    </div>
  )
}

const firstValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] || '' : value || ''

function projectsHref({ query, topic }: { query?: string; topic?: string }) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (topic) params.set('topic', topic)
  return params.size ? `/projects?${params.toString()}` : '/projects'
}
