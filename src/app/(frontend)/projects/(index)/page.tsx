import type { Metadata } from 'next'
import Link from 'next/link'

import { MultiFilterDropdown } from '@/components/multi-filter-dropdown'
import { ProjectCard } from '@/components/project-card'
import { ProjectSearch } from '@/components/projects/project-search'
import { getPublishedProjects } from '@/lib/portfolio-data'
import { absoluteURL, nonIndexableRobots, serializeJsonLd } from '@/lib/seo'

export const revalidate = 300

const pageTitle = 'Backend Developer Projects'
const pageDescription =
  'Explore backend development projects by Soumajit Ghosh, including APIs, distributed systems, cloud infrastructure, open-source software, and developer tools.'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; topic?: string | string[] }>
}): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = Boolean(firstValue(params.q).trim() || allValues(params.topic).length)

  return {
    alternates: { canonical: '/projects' },
    description: pageDescription,
    openGraph: {
      description: pageDescription,
      title: pageTitle,
      type: 'website',
      url: '/projects',
    },
    ...(hasFilters ? { robots: nonIndexableRobots } : {}),
    title: pageTitle,
    twitter: {
      card: 'summary_large_image',
      description: pageDescription,
      title: pageTitle,
    },
  }
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; topic?: string | string[] }>
}) {
  const params = await searchParams
  const query = firstValue(params.q).trim()
  const normalizedQuery = query.toLowerCase()
  const selectedTopics = Array.from(
    new Set(
      allValues(params.topic)
        .map((topic) => topic.trim().toLowerCase())
        .filter(Boolean),
    ),
  )
  const projects = await getPublishedProjects()
  const topics = Array.from(
    new Map(
      projects.flatMap((project) => project.topics || []).map((item) => [item.slug, item]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name))
  const knownTopicSlugs = new Set(topics.map((item) => item.slug))
  const topicsExist = selectedTopics.every((topic) => knownTopicSlugs.has(topic))
  const validSelectedTopics = selectedTopics.filter((topic) => knownTopicSlugs.has(topic))
  const visibleProjects = projects.filter((project) => {
    const projectTopicSlugs = new Set(project.topics?.map((item) => item.slug) || [])
    const matchesTopic = validSelectedTopics.every((topic) => projectTopicSlugs.has(topic))
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
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          item: absoluteURL('/'),
          name: 'Home',
          position: 1,
        },
        {
          '@type': 'ListItem',
          item: absoluteURL('/projects'),
          name: 'Backend Projects',
          position: 2,
        },
      ],
    },
    description: pageDescription,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: visibleProjects.map((project, index) => ({
        '@type': 'ListItem',
        item: {
          '@type': 'SoftwareSourceCode',
          description: project.shortDescription,
          name: project.title,
          url: absoluteURL(`/projects/${project.slug}`),
        },
        position: index + 1,
      })),
      numberOfItems: visibleProjects.length,
    },
    name: pageTitle,
    url: absoluteURL('/projects'),
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <main className="page-container py-10 sm:py-12 md:py-16">
        <p className="font-mono text-xs text-terminal-green sm:text-sm">
          soumajit@portfolio:<span className="text-terminal-blue">~</span>$ ls ./projects
        </p>
        <h1 className="page-title mt-4 font-semibold">Published projects</h1>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="page-lede max-w-2xl text-muted-foreground">
            Production-minded APIs, distributed systems, cloud infrastructure, open-source software,
            and developer tools.
          </p>
          <span
            aria-live="polite"
            className="font-mono text-[0.6875rem] text-terminal-yellow sm:text-xs"
          >
            {visibleProjects.length} {visibleProjects.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <section
          aria-label="Search and filter projects"
          className="mt-8 rounded-lg border border-border bg-card/40 p-3 sm:p-5"
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
            <ProjectSearch initialQuery={query} />
            {topics.length ? (
              <MultiFilterDropdown
                accessibleLabel="Filter projects by technology"
                allLabel="All technologies"
                key={validSelectedTopics.join('|')}
                name="topic"
                options={topics.map((item) => ({ label: item.name, value: item.slug }))}
                values={validSelectedTopics}
              />
            ) : null}
          </div>
        </section>

        {!topicsExist ? (
          <div className="mt-10 rounded-lg border border-destructive/40 bg-card p-6 font-mono text-sm">
            <p className="text-terminal-red">
              error: unknown topic &quot;
              {selectedTopics.filter((topic) => !knownTopicSlugs.has(topic)).join(', ')}&quot;
            </p>
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
                <p className="mt-2">Try another term or clear the active technologies.</p>
                <Link
                  className="mt-3 inline-block text-primary hover:underline"
                  href={projectsHref({ topics: validSelectedTopics })}
                >
                  ./clear-search
                </Link>
              </>
            ) : (
              'output: no published projects found'
            )}
          </div>
        )}
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
          type="application/ld+json"
        />
      </main>
    </div>
  )
}

const firstValue = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] || '' : value || ''

const allValues = (value?: string | string[]) =>
  (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean)

function projectsHref({ query, topics = [] }: { query?: string; topics?: string[] }) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  for (const topic of topics) params.append('topic', topic)
  return params.size ? `/projects?${params.toString()}` : '/projects'
}
