import { CalendarDays } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProjectCard } from '@/components/project-card'
import { ProjectDetailSidebar } from '@/components/projects/project-detail-sidebar'
import { ProjectMedia } from '@/components/projects/project-media'
import { ProjectOverview } from '@/components/rich-text'
import { StarButton } from '@/components/star-button'
import { Badge } from '@/components/ui/badge'
import { formatLabel } from '@/lib/content'
import { getPublishedProject, getRelatedProjects } from '@/lib/portfolio-data'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getPublishedProject(slug)
  if (!project) return { title: 'soumajit in ~/404' }

  const title = `soumajit in ~/projects/${project.slug}`
  const description = `README: ${project.shortDescription}`
  return {
    alternates: { canonical: `/projects/${project.slug}` },
    description,
    openGraph: {
      description,
      modifiedTime: project.updatedAt,
      publishedTime: project.publishedAt || undefined,
      title,
      type: 'article',
      url: `/projects/${project.slug}`,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      title,
    },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getPublishedProject(slug)
  if (!project) notFound()

  const related = await getRelatedProjects(project)
  const cover =
    project.coverImage && typeof project.coverImage === 'object' ? project.coverImage : null

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <main className="page-container py-8 sm:py-10 md:py-14">
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 font-mono text-[0.6875rem] leading-5 text-muted-foreground sm:text-sm"
        >
          <Link className="hover:text-primary" href="/projects">
            ~/projects
          </Link>
          <span>/</span>
          <span className="min-w-0 break-all text-terminal-cyan">{project.slug}</span>
        </nav>
        <p className="mt-6 font-mono text-xs text-terminal-green sm:text-sm">$ cat README.md</p>

        <header className="mt-5 border-b border-border pb-8">
          <div className="max-w-4xl">
            <h1 className="detail-title break-words font-semibold">{project.title}</h1>
            <p className="detail-lede mt-4 text-muted-foreground lg:text-lg">
              {project.shortDescription}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge variant="secondary">{formatLabel(project.category)}</Badge>
              <Badge className="text-terminal-green" variant="outline">
                {formatLabel(project.status)}
              </Badge>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
            {(project.projectYear || project.publishedAt) && (
              <span className="flex items-center gap-2 pt-2 font-mono text-xs text-terminal-yellow">
                <CalendarDays className="size-4" aria-hidden="true" />
                {project.projectYear || new Date(project.publishedAt as string).getFullYear()}
              </span>
            )}
            <div className="ml-auto">
              <StarButton slug={project.slug} />
            </div>
          </div>
        </header>

        <div className="mt-8 grid items-start gap-8 sm:mt-10 lg:grid-cols-[minmax(0,3fr)_minmax(15rem,1fr)] lg:gap-10 xl:gap-14">
          <div className="min-w-0">
            {cover?.url && <ProjectMedia className="mt-0 max-w-none" media={cover} priority />}

            <article className={cover?.url ? 'mt-10' : undefined}>
              <ProjectOverview data={project.overview} />
            </article>
          </div>

          <ProjectDetailSidebar links={project.links} topics={project.topics} />
        </div>

        {project.gallery?.length ? (
          <section aria-labelledby="gallery-heading" className="mt-16 border-t border-border pt-10">
            <h2 id="gallery-heading" className="section-title font-semibold">
              ./media
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {project.gallery.map((item) => {
                const media = typeof item.media === 'object' ? item.media : null
                if (!media?.url) return null
                return (
                  <ProjectMedia caption={item.caption} key={item.id || media.id} media={media} />
                )
              })}
            </div>
          </section>
        ) : null}

        {related.length ? (
          <section aria-labelledby="related-heading" className="mt-16 border-t border-border pt-10">
            <h2 id="related-heading" className="section-title font-semibold">
              ./related-projects
            </h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {related.map((item, index) => (
                <ProjectCard index={index} key={item.id} project={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}
