import { cache } from 'react'
import { getPayload } from 'payload'

import type { OSSContribution } from '@/payload-types'
import config from '@/payload.config'

export type ContributionCardData = Pick<
  OSSContribution,
  | 'additions'
  | 'author'
  | 'changedFiles'
  | 'deletions'
  | 'featured'
  | 'id'
  | 'mergedAt'
  | 'organization'
  | 'portfolioSummary'
  | 'prCreatedAt'
  | 'prNumber'
  | 'prUrl'
  | 'repoDescription'
  | 'repository'
  | 'repoUrl'
  | 'stars'
  | 'status'
  | 'tags'
  | 'title'
>

const contributionSelect = {
  additions: true,
  author: true,
  changedFiles: true,
  deletions: true,
  featured: true,
  mergedAt: true,
  organization: true,
  portfolioSummary: true,
  prCreatedAt: true,
  prNumber: true,
  prUrl: true,
  repoDescription: true,
  repository: true,
  repoUrl: true,
  stars: true,
  status: true,
  tags: true,
  title: true,
} as const

export const getVisibleContributions = cache(async (): Promise<ContributionCardData[]> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'oss-contributions',
    depth: 0,
    limit: 500,
    overrideAccess: false,
    pagination: false,
    select: contributionSelect,
    sort: ['-featured', 'displayOrder', '-mergedAt', '-prCreatedAt'],
    where: { hidden: { not_equals: true } },
  })

  return result.docs
})
