import type { MetadataRoute } from 'next'

import { getPublishedBlogSlugs } from '@/lib/blog-data'
import { getPublishedProjectSlugs } from '@/lib/portfolio-data'

export const dynamic = 'force-dynamic'
export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const [projects, posts] = await Promise.all([getPublishedProjectSlugs(), getPublishedBlogSlugs()])

  return [
    { changeFrequency: 'monthly', priority: 1, url: baseURL },
    { changeFrequency: 'weekly', priority: 0.9, url: `${baseURL}/projects` },
    { changeFrequency: 'weekly', priority: 0.9, url: `${baseURL}/blogs` },
    { changeFrequency: 'yearly', priority: 0.7, url: `${baseURL}/contact` },
    ...projects.map((project) => ({
      changeFrequency: 'monthly' as const,
      lastModified: project.updatedAt,
      priority: 0.8,
      url: `${baseURL}/projects/${project.slug}`,
    })),
    ...posts.map((post) => ({
      changeFrequency: 'monthly' as const,
      lastModified: post.updatedAt,
      priority: 0.8,
      url: `${baseURL}/blogs/${post.slug}`,
    })),
  ]
}
