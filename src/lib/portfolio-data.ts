import { cache } from 'react'
import { getPayload, type Where } from 'payload'

import type { BlogPost, Media, PortfolioSetting, Project } from '@/payload-types'
import config from '@/payload.config'

export type ProjectCardData = Pick<
  Project,
  | 'accent'
  | 'category'
  | 'featured'
  | 'id'
  | 'pinned'
  | 'projectYear'
  | 'publishedAt'
  | 'shortDescription'
  | 'slug'
  | 'status'
  | 'title'
  | 'topics'
> & {
  coverImage?: Media | null
  starCount: number
}

export type PortfolioHomeData = {
  blogPosts: HomeBlogPost[]
  projects: ProjectCardData[]
  settings: PortfolioSetting
  stack: StackTopic[]
}

export type HomeBlogPost = Pick<
  BlogPost,
  'excerpt' | 'id' | 'issueNumber' | 'labels' | 'publishedAt' | 'readingMinutes' | 'slug' | 'title'
>

export type StackTopic = {
  count: number
  name: string
  slug: string
}

const cardSelect = {
  accent: true,
  category: true,
  coverImage: true,
  featured: true,
  pinned: true,
  projectYear: true,
  publishedAt: true,
  shortDescription: true,
  slug: true,
  status: true,
  title: true,
  topics: true,
} as const

function toCard(
  project: Omit<ProjectCardData, 'coverImage' | 'starCount'> & {
    coverImage?: Media | number | null
  },
  starCount: number,
) {
  return {
    ...project,
    coverImage:
      project.coverImage && typeof project.coverImage === 'object' ? project.coverImage : null,
    starCount,
  } satisfies ProjectCardData
}

async function addStarCounts(
  projects: Array<
    Omit<ProjectCardData, 'coverImage' | 'starCount'> & { coverImage?: Media | number | null }
  >,
) {
  const payload = await getPayload({ config })
  return Promise.all(
    projects.map(async (project) => {
      const { totalDocs } = await payload.count({
        collection: 'project-stars',
        overrideAccess: true,
        where: { project: { equals: project.id } },
      })
      return toCard(project, totalDocs)
    }),
  )
}

export const getPortfolioHome = cache(async (): Promise<PortfolioHomeData> => {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({
    slug: 'portfolio-settings',
    depth: 0,
    overrideAccess: false,
  })

  const overrideIDs = (settings.featuredProjectOverride || []).map((project) =>
    typeof project === 'object' ? project.id : project,
  )

  const projectDocs = overrideIDs.length
    ? (
        await payload.find({
          collection: 'projects',
          depth: 1,
          limit: overrideIDs.length,
          overrideAccess: false,
          pagination: false,
          select: cardSelect,
          where: {
            and: [{ id: { in: overrideIDs } }, { _status: { equals: 'published' } }],
          },
        })
      ).docs.sort((a, b) => overrideIDs.indexOf(a.id) - overrideIDs.indexOf(b.id))
    : (
        await payload.find({
          collection: 'projects',
          depth: 1,
          limit: 20,
          overrideAccess: false,
          pagination: false,
          select: cardSelect,
          sort: ['displayOrder', '-publishedAt'],
          where: {
            and: [{ _status: { equals: 'published' } }, { featured: { equals: true } }],
          },
        })
      ).docs

  const stackProjects = await payload.find({
    collection: 'projects',
    depth: 0,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { topics: true },
    where: { _status: { equals: 'published' } },
  })
  const topicCounts = new Map<string, StackTopic>()
  for (const project of stackProjects.docs) {
    for (const topic of project.topics || []) {
      const current = topicCounts.get(topic.slug)
      topicCounts.set(topic.slug, {
        count: (current?.count || 0) + 1,
        name: topic.name,
        slug: topic.slug,
      })
    }
  }
  const stack = Array.from(topicCounts.values()).sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  )

  const blogSelect = {
    excerpt: true,
    issueNumber: true,
    labels: true,
    publishedAt: true,
    readingMinutes: true,
    slug: true,
    title: true,
  } as const
  const publishedBlogCondition: Where = { _status: { equals: 'published' } }
  const featuredBlogPosts = await payload.find({
    collection: 'blog-posts',
    depth: 0,
    limit: 3,
    overrideAccess: false,
    select: blogSelect,
    sort: ['-publishedAt', '-issueNumber'],
    where: {
      and: [publishedBlogCondition, { featured: { equals: true } }],
    },
  })
  const blogPosts = featuredBlogPosts.docs.length
    ? featuredBlogPosts.docs
    : (
        await payload.find({
          collection: 'blog-posts',
          depth: 0,
          limit: 3,
          overrideAccess: false,
          select: blogSelect,
          sort: ['-publishedAt', '-issueNumber'],
          where: publishedBlogCondition,
        })
      ).docs

  return { blogPosts, projects: await addStarCounts(projectDocs), settings, stack }
})

export const getPortfolioSettings = cache(async () => {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'portfolio-settings',
    depth: 0,
    overrideAccess: false,
  })
})

export const getPublishedProjects = cache(async (topic?: string): Promise<ProjectCardData[]> => {
  const payload = await getPayload({ config })
  const conditions: Where[] = [{ _status: { equals: 'published' } }]
  if (topic) conditions.push({ 'topics.slug': { equals: topic } })

  const result = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    select: cardSelect,
    sort: ['-pinned', 'displayOrder', '-publishedAt'],
    where: { and: conditions },
  })

  return addStarCounts(result.docs)
})

export const getPublishedProject = cache(async (slug: string): Promise<Project | null> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'projects',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })
  return result.docs[0] || null
})

export async function getRelatedProjects(current: Project): Promise<ProjectCardData[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 30,
    overrideAccess: false,
    pagination: false,
    select: cardSelect,
    where: {
      and: [{ _status: { equals: 'published' } }, { id: { not_equals: current.id } }],
    },
  })

  const topicSlugs = new Set(current.topics?.map((topic) => topic.slug) || [])
  const ranked = result.docs
    .map((project) => ({
      project,
      score:
        (project.topics?.filter((topic) => topicSlugs.has(topic.slug)).length || 0) * 100 +
        (project.category === current.category ? 10 : 0) +
        (project.featured ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ project }) => project)

  return addStarCounts(ranked)
}

export const getPublishedProjectSlugs = cache(async () => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'projects',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true, updatedAt: true },
    where: { _status: { equals: 'published' } },
  })
  return result.docs
})
