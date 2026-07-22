import type { MetadataRoute } from 'next'

import { getPublishedProjectSlugs } from '@/lib/portfolio-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const projects = await getPublishedProjectSlugs()

  return [
    { changeFrequency: 'monthly', priority: 1, url: baseURL },
    { changeFrequency: 'weekly', priority: 0.9, url: `${baseURL}/projects` },
    { changeFrequency: 'yearly', priority: 0.7, url: `${baseURL}/contact` },
    ...projects.map((project) => ({
      changeFrequency: 'monthly' as const,
      lastModified: project.updatedAt,
      priority: 0.8,
      url: `${baseURL}/projects/${project.slug}`,
    })),
  ]
}
