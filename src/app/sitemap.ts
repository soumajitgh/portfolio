import type { MetadataRoute } from 'next'

import { getPublishedBlogSlugs } from '@/lib/blog-data'
import { getPublishedProjectSlugs } from '@/lib/portfolio-data'
import { absoluteURL } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([getPublishedProjectSlugs(), getPublishedBlogSlugs()])

  return [
    { changeFrequency: 'monthly', priority: 1, url: absoluteURL('/') },
    { changeFrequency: 'weekly', priority: 0.9, url: absoluteURL('/projects') },
    { changeFrequency: 'weekly', priority: 0.9, url: absoluteURL('/blogs') },
    { changeFrequency: 'yearly', priority: 0.7, url: absoluteURL('/contact') },
    ...projects.map((project) => ({
      changeFrequency: 'monthly' as const,
      lastModified: project.updatedAt,
      priority: 0.8,
      url: absoluteURL(`/projects/${project.slug}`),
    })),
    ...posts.map((post) => ({
      changeFrequency: 'monthly' as const,
      lastModified: post.updatedAt,
      priority: 0.8,
      url: absoluteURL(`/blogs/${post.slug}`),
    })),
  ]
}
