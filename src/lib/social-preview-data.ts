import { cache } from 'react'
import { getPayload } from 'payload'

import type { BlogPost, Project } from '@/payload-types'
import config from '@/payload.config'

import type { SocialPreviewIdentity } from './social-preview'

const skipDatabaseDuringBuild = process.env.SKIP_DATABASE_DURING_BUILD === 'true'

export type BlogSocialPreviewData = Pick<
  BlogPost,
  'excerpt' | 'issueNumber' | 'labels' | 'publishedAt' | 'slug' | 'title'
>

export type ProjectSocialPreviewData = Pick<
  Project,
  'shortDescription' | 'slug' | 'status' | 'title' | 'topics'
> & { starCount: number }

const providerName = (label: string, url: string) => {
  const provider = `${label} ${url}`.toLowerCase()
  if (provider.includes('github')) return 'github'
  if (provider.includes('linkedin')) return 'linkedin'
  if (provider.includes('twitter') || provider.includes('x.com')) return 'x'
  if (provider.includes('youtube')) return 'youtube'
  if (provider.includes('instagram')) return 'instagram'
  return label.trim().toLowerCase().replace(/\s+/g, '-')
}

export const getSocialPreviewIdentity = cache(async (): Promise<SocialPreviewIdentity> => {
  if (skipDatabaseDuringBuild) {
    return { name: 'Soumajit Ghosh', site: 'soumajit.dev', socials: ['github'] }
  }

  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'portfolio-settings',
      depth: 0,
      overrideAccess: false,
      select: { contact: true },
    })
    const socials = Array.from(
      new Set(
        (settings.contact?.socials || []).map((social) => providerName(social.label, social.url)),
      ),
    )

    return { name: 'Soumajit Ghosh', site: 'soumajit.dev', socials }
  } catch {
    return { name: 'Soumajit Ghosh', site: 'soumajit.dev', socials: ['github'] }
  }
})

export const getProjectSocialPreview = cache(
  async (slug: string): Promise<ProjectSocialPreviewData | null> => {
    if (skipDatabaseDuringBuild) return null

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'projects',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      select: {
        shortDescription: true,
        slug: true,
        status: true,
        title: true,
        topics: true,
      },
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
      },
    })
    const project = result.docs[0]
    if (!project) return null

    const stars = await payload.count({
      collection: 'project-stars',
      overrideAccess: true,
      where: { project: { equals: project.id } },
    })

    return { ...project, starCount: stars.totalDocs }
  },
)

export const getBlogSocialPreview = cache(
  async (slug: string): Promise<BlogSocialPreviewData | null> => {
    if (skipDatabaseDuringBuild) return null

    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'blog-posts',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      select: {
        excerpt: true,
        issueNumber: true,
        labels: true,
        publishedAt: true,
        slug: true,
        title: true,
      },
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
      },
    })

    return result.docs[0] || null
  },
)
