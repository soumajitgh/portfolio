import type { MetadataRoute } from 'next'

import { getPublishedProjectSlugs } from '@/lib/portfolio-data'
import { absoluteURL } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 300

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjectSlugs()

  return [
    { changeFrequency: 'monthly', priority: 1, url: absoluteURL('/') },
    { changeFrequency: 'weekly', priority: 0.9, url: absoluteURL('/work') },
    { changeFrequency: 'weekly', priority: 0.9, url: absoluteURL('/projects') },
    { changeFrequency: 'weekly', priority: 0.9, url: absoluteURL('/contributions') },
    { changeFrequency: 'daily', priority: 0.8, url: absoluteURL('/stats') },
    { changeFrequency: 'daily', priority: 0.7, url: absoluteURL('/stats/leetcode') },
    { changeFrequency: 'daily', priority: 0.7, url: absoluteURL('/stats/github') },
    { changeFrequency: 'daily', priority: 0.7, url: absoluteURL('/stats/ai') },
    { changeFrequency: 'yearly', priority: 0.7, url: absoluteURL('/contact') },
    ...projects.map((project) => ({
      changeFrequency: 'monthly' as const,
      lastModified: project.updatedAt,
      priority: 0.8,
      url: absoluteURL(`/projects/${project.slug}`),
    })),
  ]
}
