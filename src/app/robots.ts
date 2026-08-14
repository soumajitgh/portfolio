import type { MetadataRoute } from 'next'

import { getSiteURL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const siteURL = getSiteURL()

  return {
    host: siteURL,
    rules: {
      allow: '/',
      disallow: ['/admin', '/admin/'],
      userAgent: '*',
    },
    sitemap: `${siteURL}/sitemap.xml`,
  }
}
