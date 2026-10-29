import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PortfolioEntrance } from '@/components/portfolio/entrance'
import { ProjectMedia } from '@/components/projects/project-media'
import { ProjectOverview } from '@/components/rich-text'
import { getPublishedProject } from '@/lib/portfolio-data'
import {
  absoluteURL,
  getMediaURL,
  serializeJsonLd,
  siteName,
  siteProfiles,
  siteRole,
} from '@/lib/seo'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getPublishedProject(slug).catch(() => undefined)
  if (project === undefined) return { title: 'Project unavailable', robots: { index: false } }
  if (!project) return { title: 'Project not found', robots: { index: false } }

  const title = project.seo?.title || `${project.title} – Technical`
  const description = project.seo?.description || project.shortDescription
  const socialImage = getMediaURL(project.seo?.image || project.coverImage)

  return {
    alternates: { canonical: `/projects/${project.slug}` },
    description,
    openGraph: {
      description,
      modifiedTime: project.updatedAt,
      publishedTime: project.publishedAt || undefined,
      tags: project.topics?.map((topic) => topic.name),
      title,
      type: 'article',
      url: `/projects/${project.slug}`,
      ...(socialImage ? { images: [{ alt: project.title, url: socialImage }] } : {}),
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      title,
      ...(socialImage ? { images: [socialImage] } : {}),
    },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getPublishedProject(slug).catch(() => undefined)
  if (project === undefined)
    return (
      <main className="portfolio-area" data-identity="technical">
        <div className="portfolio-container portfolio-intro">
          <Link href="/technical">← Technical</Link>
          <h1>Project unavailable</h1>
          <p>The project records could not be loaded. Please try again shortly.</p>
        </div>
      </main>
    )
  if (!project) notFound()

  const cover =
    project.coverImage && typeof project.coverImage === 'object' ? project.coverImage : null
  const canonicalURL = absoluteURL(`/projects/${project.slug}`)
  const socialImage = getMediaURL(project.seo?.image || project.coverImage)
  const externalLinks = project.links?.map((link) => link.url).filter(Boolean) || []
  const repositoryURL =
    project.links?.find((link) => link.type === 'github')?.url ||
    (project.repositoryOwner && project.repositoryName
      ? `https://github.com/${project.repositoryOwner}/${project.repositoryName}`
      : undefined)
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareSourceCode',
        author: {
          '@id': `${absoluteURL('/')}#person`,
          '@type': 'Person',
          jobTitle: siteRole,
          name: siteName,
          sameAs: siteProfiles,
          url: absoluteURL('/'),
        },
        codeRepository: repositoryURL,
        dateModified: project.updatedAt,
        datePublished: project.publishedAt || undefined,
        description: project.seo?.description || project.shortDescription,
        image: socialImage,
        isAccessibleForFree: true,
        keywords: project.topics?.map((topic) => topic.name),
        mainEntityOfPage: canonicalURL,
        name: project.title,
        sameAs: externalLinks.length ? externalLinks : undefined,
        url: canonicalURL,
      },
      {
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
            item: absoluteURL('/technical'),
            name: 'Technical',
            position: 2,
          },
          {
            '@type': 'ListItem',
            item: canonicalURL,
            name: project.title,
            position: 3,
          },
        ],
      },
    ],
  }

  return (
    <main className="portfolio-area project-story" data-identity="technical">
      <div className="portfolio-container">
        <nav aria-label="Breadcrumb" className="portfolio-breadcrumb">
          <Link href="/technical">Technical</Link>
          <span aria-hidden="true">/</span>
          <Link href="/projects">Projects</Link>
          <span aria-hidden="true">/</span>
          <span>{project.title}</span>
        </nav>
        <PortfolioEntrance>
          <header className="portfolio-intro" data-portfolio-intro>
            <p className="portfolio-eyebrow">
              Project {project.projectYear ? ` / ${project.projectYear}` : ''}
            </p>
            <h1>{project.title}</h1>
            <p>{project.shortDescription}</p>
          </header>
        </PortfolioEntrance>
        {cover?.url ? <ProjectMedia media={cover} priority className="story-cover" /> : null}
        <div className="story-body">
          <article className="story-prose">
            <ProjectOverview data={project.overview} />
          </article>
          <aside aria-label="Project resources">
            {project.links?.length ? (
              <section>
                <h2>Explore the project</h2>
                <ul>
                  {project.links.map((link) => (
                    <li key={link.id || link.url}>
                      <a href={link.url}>{link.label} ↗</a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {project.topics?.length ? (
              <section>
                <h2>Built with</h2>
                <ul>
                  {project.topics.map((topic) => (
                    <li key={topic.slug}>
                      <Link href={`/projects?topic=${topic.slug}`}>{topic.name}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </aside>
        </div>
        {project.gallery?.length ? (
          <section className="portfolio-section" aria-labelledby="gallery-heading">
            <h2 id="gallery-heading">A closer look</h2>
            <div className="story-gallery">
              {project.gallery.map((item) => {
                const media = typeof item.media === 'object' ? item.media : null
                return media?.url ? (
                  <ProjectMedia key={item.id || media.id} caption={item.caption} media={media} />
                ) : null
              })}
            </div>
          </section>
        ) : null}
        <footer className="portfolio-footer">
          <Link href="/technical">← All Technical work</Link>
          <Link href="/creative">Explore Creative ↗</Link>
        </footer>
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
          type="application/ld+json"
        />
      </div>
    </main>
  )
}
