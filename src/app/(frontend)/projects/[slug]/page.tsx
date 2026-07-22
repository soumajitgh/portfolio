import { ArrowUpRight, CalendarDays } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProjectCard } from '@/components/project-card'
import { ProjectOverview } from '@/components/rich-text'
import { SiteHeader } from '@/components/site-header'
import { StarButton } from '@/components/star-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatLabel } from '@/lib/content'
import { getPublishedProject, getRelatedProjects } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

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
    <div className="min-h-dvh">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <nav aria-label="Breadcrumb" className="font-mono text-xs text-muted-foreground sm:text-sm">
          <Link className="hover:text-primary" href="/projects">
            ~/projects
          </Link>
          <span>/</span>
          <span className="text-terminal-cyan">{project.slug}</span>
        </nav>
        <p className="mt-6 font-mono text-sm text-terminal-green">$ cat README.md</p>

        <header className="mt-5 border-b border-border pb-8">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-semibold md:text-5xl">{project.title}</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
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

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(15rem,1fr)] xl:gap-14">
          <div className="min-w-0">
            {cover?.url && <ProjectImage className="mt-0 max-w-none" media={cover} priority />}

            <article className={cover?.url ? 'mt-10' : undefined}>
              <ProjectOverview data={project.overview} />
            </article>
          </div>

          <aside
            aria-label="Project details"
            className="border-t border-border pt-7 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0"
          >
            <section aria-labelledby="project-stack-heading">
              <h2
                className="font-mono text-sm font-medium text-terminal-cyan"
                id="project-stack-heading"
              >
                const stack = [
              </h2>
              {project.topics?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.topics.map((topic) => (
                    <Badge
                      asChild
                      className="text-terminal-purple"
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

            <section
              aria-labelledby="project-links-heading"
              className="mt-8 border-t border-border pt-7"
            >
              <h2
                className="font-mono text-sm font-medium text-terminal-green"
                id="project-links-heading"
              >
                ./links
              </h2>
              {project.links?.length ? (
                <div className="mt-4 flex flex-col gap-2">
                  {project.links.map((link) => {
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
                          ./{link.label.toLowerCase().replaceAll(' ', '-')}
                          <ArrowUpRight aria-hidden="true" />
                        </a>
                      </Button>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-3 font-mono text-xs text-muted-foreground">
                  output: no external links
                </p>
              )}
            </section>
          </aside>
        </div>

        {project.gallery?.length ? (
          <section aria-labelledby="gallery-heading" className="mt-16 border-t border-border pt-10">
            <h2 id="gallery-heading" className="text-2xl font-semibold">
              ./media
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {project.gallery.map((item) => {
                const media = typeof item.media === 'object' ? item.media : null
                if (!media?.url) return null
                return (
                  <ProjectImage caption={item.caption} key={item.id || media.id} media={media} />
                )
              })}
            </div>
          </section>
        ) : null}

        {related.length ? (
          <section aria-labelledby="related-heading" className="mt-16 border-t border-border pt-10">
            <h2 id="related-heading" className="text-2xl font-semibold">
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

function ProjectImage({
  caption,
  className,
  media,
  priority = false,
}: {
  caption?: null | string
  className?: string
  media: Media
  priority?: boolean
}) {
  if (!media.url) return null
  return (
    <figure className={cn('mx-auto mt-10 max-w-5xl', className)}>
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
        <Image
          alt={media.alt}
          className="object-contain"
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 960px"
          src={media.url}
        />
      </div>
      {(caption || media.caption) && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption || media.caption}
        </figcaption>
      )}
    </figure>
  )
}
