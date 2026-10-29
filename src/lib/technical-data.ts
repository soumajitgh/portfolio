import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'

// No live GitHub, telemetry, or star-count requests in the editorial index.
export const getTechnicalPortfolio = cache(async () => {
  const payload = await getPayload({ config })
  const [projects, contributions] = await Promise.all([
    payload.find({
      collection: 'projects',
      overrideAccess: false,
      depth: 1,
      limit: 100,
      pagination: false,
      sort: ['displayOrder', '-publishedAt'],
      where: { _status: { equals: 'published' } },
    }),
    payload.find({
      collection: 'oss-contributions',
      overrideAccess: false,
      depth: 0,
      limit: 100,
      pagination: false,
      sort: ['-mergedAt', '-prCreatedAt'],
      where: { and: [{ hidden: { not_equals: true } }, { status: { in: ['open', 'merged'] } }] },
    }),
  ])
  return {
    projects: projects.docs,
    contributions: contributions.docs
      .filter((item) => !item.prDescription?.includes('Development fixture'))
      .slice(0, 6),
  }
})
