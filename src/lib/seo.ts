import type { Media } from '@/payload-types'

const fallbackSiteURL = 'http://localhost:3000'

export const siteName = 'Soumajit Ghosh'
export const siteRole = 'Fullstack Developer'
export const siteTitle = `${siteName} – ${siteRole}`
export const siteDescription =
  'Fullstack developer Soumajit Ghosh builds accessible web applications, reliable APIs, and production-ready systems with TypeScript, Next.js, and Payload CMS.'

export function getSiteURL() {
  return (process.env.NEXT_PUBLIC_SITE_URL || fallbackSiteURL).replace(/\/$/, '')
}

export function absoluteURL(path = '/') {
  return new URL(path, `${getSiteURL()}/`).toString()
}

export function getMediaURL(media: Media | number | null | undefined) {
  if (!media || typeof media !== 'object' || !media.url) return undefined
  return absoluteURL(media.url)
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

export const indexableRobots = {
  follow: true,
  googleBot: {
    follow: true,
    index: true,
    'max-image-preview': 'large' as const,
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  index: true,
}

export const nonIndexableRobots = {
  follow: true,
  googleBot: {
    follow: true,
    index: false,
  },
  index: false,
}
