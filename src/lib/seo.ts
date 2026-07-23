import type { Media } from '@/payload-types'

const fallbackSiteURL = 'http://localhost:3000'

export const siteName = 'Soumajit Ghosh'
export const siteRole = 'Fullstack Developer'
export const siteTitle = `${siteName} – ${siteRole}`
export const siteDescription =
  'Soumajit Ghosh is a fullstack developer building AI-powered web and desktop products with React, Next.js, NestJS, Python, PostgreSQL, and Docker.'
export const siteProfiles = [
  'https://github.com/soumajitgh',
  'https://www.linkedin.com/in/soumajit-ghosh',
]
export const siteExpertise = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'React',
  'Next.js',
  'NestJS',
  'Express.js',
  'Spring Boot',
  'FastAPI',
  'Electron',
  'Generative AI',
  'Large language models',
  'AI agents',
  'Retrieval-augmented generation',
  'Vector search',
  'GraphQL',
  'REST APIs',
  'gRPC',
  'Kafka',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'Qdrant',
  'AWS',
  'Google Cloud',
  'Railway',
  'Docker',
  'Linux',
  'CI/CD',
]
export const siteKeywords = [
  'fullstack developer',
  'full stack developer',
  'AI developer',
  'React developer',
  'Next.js developer',
  'NestJS developer',
  'TypeScript developer',
  'Python developer',
  'generative AI developer',
  'LLM applications',
  'AI agents',
  'RAG systems',
  'Electron developer',
  'GraphQL API development',
  'PostgreSQL',
  'Docker',
]

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
