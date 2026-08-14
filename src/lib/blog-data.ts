import { cache } from 'react'
import { getPayload, type Where } from 'payload'

import type { BlogPost } from '@/payload-types'
import config from '@/payload.config'

export const BLOG_PAGE_SIZE = 12

export type BlogPostListItem = Pick<
  BlogPost,
  | 'excerpt'
  | 'id'
  | 'issueNumber'
  | 'labels'
  | 'publishedAt'
  | 'readingMinutes'
  | 'slug'
  | 'title'
  | 'updatedAt'
>

export type BlogIndexResult = {
  docs: BlogPostListItem[]
  hasNextPage: boolean
  hasPrevPage: boolean
  labels: string[]
  page: number
  requestedPageIsValid: boolean
  totalDocs: number
  totalPages: number
}

const listSelect = {
  excerpt: true,
  issueNumber: true,
  labels: true,
  publishedAt: true,
  readingMinutes: true,
  slug: true,
  title: true,
  updatedAt: true,
} as const

const normalizeQuery = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase()

const rankPost = (post: Pick<BlogPost, 'excerpt' | 'labels' | 'title'>, query: string) => {
  const title = post.title.toLowerCase()
  const labels = post.labels?.map((label) => label.name.toLowerCase()) || []
  const excerpt = post.excerpt?.toLowerCase() || ''

  if (title === query) return 600
  if (title.startsWith(query)) return 500
  if (title.includes(query)) return 400
  if (labels.some((label) => label === query)) return 300
  if (labels.some((label) => label.includes(query))) return 250
  if (excerpt.includes(query)) return 200
  return 100
}

export const getBlogIndex = cache(
  async (rawQuery = '', rawLabel = '', requestedPage = 1): Promise<BlogIndexResult> => {
    const payload = await getPayload({ config })
    const query = normalizeQuery(rawQuery)
    const label = rawLabel.trim().toLowerCase()
    const conditions: Where[] = [{ _status: { equals: 'published' } }]

    if (label) conditions.push({ 'labels.name': { equals: label } })
    if (query) {
      conditions.push({
        or: [
          { title: { contains: query } },
          { excerpt: { contains: query } },
          { 'labels.name': { contains: query } },
          { searchText: { contains: query } },
        ],
      })
    }

    const [matching, labelSource] = await Promise.all([
      payload.find({
        collection: 'blog-posts',
        depth: 0,
        limit: 500,
        overrideAccess: false,
        pagination: false,
        select: query ? { ...listSelect, searchText: true } : listSelect,
        sort: ['-publishedAt', '-issueNumber'],
        where: { and: conditions },
      }),
      payload.find({
        collection: 'blog-posts',
        depth: 0,
        limit: 500,
        overrideAccess: false,
        pagination: false,
        select: { labels: true },
        where: { _status: { equals: 'published' } },
      }),
    ])

    const ranked = query
      ? [...matching.docs].sort((a, b) => {
          const rankDifference = rankPost(b, query) - rankPost(a, query)
          if (rankDifference) return rankDifference
          const dateDifference =
            new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
          return dateDifference || b.issueNumber - a.issueNumber
        })
      : matching.docs

    const totalDocs = ranked.length
    const totalPages = Math.ceil(totalDocs / BLOG_PAGE_SIZE)
    const page = Math.max(1, Math.floor(requestedPage) || 1)
    const requestedPageIsValid = totalPages === 0 ? page === 1 : page <= totalPages
    const start = (page - 1) * BLOG_PAGE_SIZE
    const labels = Array.from(
      new Set(labelSource.docs.flatMap((post) => post.labels?.map((item) => item.name) || [])),
    ).sort()

    return {
      docs: ranked.slice(start, start + BLOG_PAGE_SIZE),
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1 && page <= totalPages,
      labels,
      page,
      requestedPageIsValid,
      totalDocs,
      totalPages,
    }
  },
)

export const getPublishedBlogPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog-posts',
    depth: 2,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })
  return result.docs[0] || null
})

export const getBlogNeighbors = cache(async (id: number) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog-posts',
    depth: 0,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    select: listSelect,
    sort: ['-publishedAt', '-issueNumber'],
    where: { _status: { equals: 'published' } },
  })
  const index = result.docs.findIndex((post) => post.id === id)

  return {
    newer: index > 0 ? result.docs[index - 1] : null,
    older: index >= 0 && index < result.docs.length - 1 ? result.docs[index + 1] : null,
  }
})

export const getPublishedBlogSlugs = cache(async () => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog-posts',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true, updatedAt: true },
    where: { _status: { equals: 'published' } },
  })
  return result.docs
})

export const getBlogFeedPosts = cache(async () => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog-posts',
    depth: 0,
    limit: 50,
    overrideAccess: false,
    select: listSelect,
    sort: ['-publishedAt', '-issueNumber'],
    where: { _status: { equals: 'published' } },
  })
  return result.docs
})
