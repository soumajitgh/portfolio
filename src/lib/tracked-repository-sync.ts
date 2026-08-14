import type { Payload } from 'payload'

import type { TrackedRepository } from '@/payload-types'
import {
  fetchTrackedRepositoryContributions,
  GitHubContributionUnavailableError,
} from '@/lib/github-contributions'
import { scheduleRevalidation } from '@/lib/revalidation'

const ERROR_RETRY_DELAY_MS = 30 * 60 * 1000
const DEFAULT_SYNC_INTERVAL_HOURS = 2

type RepositorySyncResult = {
  cached: boolean
  created: number
  repositoryId: number
  updated: number
}

export type TrackedRepositorySyncSummary = {
  cached: number
  contributionsCreated: number
  contributionsUpdated: number
  failed: number
  repositoriesSynced: number
}

function nextSyncDate(now: Date, intervalHours?: null | number) {
  const hours = Math.max(1, intervalHours || DEFAULT_SYNC_INTERVAL_HOURS)
  return new Date(now.getTime() + hours * 60 * 60 * 1000)
}

function retryDate(now: Date, error: unknown) {
  const normalRetry = new Date(now.getTime() + ERROR_RETRY_DELAY_MS)
  if (!(error instanceof GitHubContributionUnavailableError) || !error.retryAt) {
    return normalRetry
  }

  const reset = new Date(error.retryAt)
  if (Number.isNaN(reset.getTime())) return normalRetry
  reset.setMinutes(reset.getMinutes() + 1)
  return reset > normalRetry ? reset : normalRetry
}

async function findExistingContribution(
  payload: Payload,
  githubNodeId: null | string,
  prKey: string,
) {
  const clauses: Record<string, { equals: string }>[] = [{ prKey: { equals: prKey } }]
  if (githubNodeId) clauses.unshift({ githubNodeId: { equals: githubNodeId } })

  const existing = await payload.find({
    collection: 'oss-contributions',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { or: clauses },
  })

  return existing.docs[0]
}

export async function syncTrackedRepository(
  payload: Payload,
  repository: TrackedRepository,
  options: { force?: boolean; now?: Date } = {},
): Promise<RepositorySyncResult> {
  const now = options.now || new Date()
  const nowISO = now.toISOString()

  if (repository.enabled === false) {
    return { cached: true, created: 0, repositoryId: repository.id, updated: 0 }
  }

  if (!options.force && new Date(repository.nextSyncAt).getTime() > now.getTime()) {
    return { cached: true, created: 0, repositoryId: repository.id, updated: 0 }
  }

  await payload.update({
    collection: 'tracked-repositories',
    context: { skipRepositorySync: true },
    data: {
      lastSyncAttemptAt: nowISO,
      syncError: null,
      syncStatus: 'syncing',
    },
    id: repository.id,
    overrideAccess: true,
  })

  try {
    const snapshot = await fetchTrackedRepositoryContributions({
      author: repository.githubUsername,
      owner: repository.organization,
      repo: repository.repository,
    })
    let created = 0
    let updated = 0

    for (const metadata of snapshot.contributions) {
      const existing = await findExistingContribution(
        payload,
        metadata.githubNodeId,
        metadata.prKey,
      )
      const syncData = {
        ...metadata,
        githubSyncError: null,
        githubSyncedAt: nowISO,
        githubSyncStatus: 'synced' as const,
        trackedRepository: repository.id,
      }

      if (existing) {
        await payload.update({
          collection: 'oss-contributions',
          context: { disableRevalidate: true, skipGitHubSync: true },
          data: syncData,
          id: existing.id,
          overrideAccess: true,
        })
        updated += 1
      } else {
        await payload.create({
          collection: 'oss-contributions',
          context: { disableRevalidate: true, skipGitHubSync: true },
          data: {
            ...syncData,
            displayOrder: 100,
            featured: false,
            hidden: false,
          },
          overrideAccess: true,
        })
        created += 1
      }
    }

    await payload.update({
      collection: 'tracked-repositories',
      context: { skipRepositorySync: true },
      data: {
        discoveredPullRequests: snapshot.contributions.length,
        githubRateLimitRemaining: snapshot.rateLimit.remaining,
        githubRateLimitResetAt: snapshot.rateLimit.resetAt,
        githubRequestsLastSync: snapshot.requestCount,
        lastSyncedAt: nowISO,
        nextSyncAt: nextSyncDate(now, repository.syncIntervalHours).toISOString(),
        organization: snapshot.repository.organization,
        repoDescription: snapshot.repository.repoDescription,
        repoKey: snapshot.repository.repoKey,
        repository: snapshot.repository.repository,
        repositoryUrl: snapshot.repository.repoUrl,
        stars: snapshot.repository.stars,
        syncError: null,
        syncStatus: 'synced',
      },
      id: repository.id,
      overrideAccess: true,
    })

    return { cached: false, created, repositoryId: repository.id, updated }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown GitHub sync error.'
    await payload.update({
      collection: 'tracked-repositories',
      context: { skipRepositorySync: true },
      data: {
        nextSyncAt: retryDate(now, error).toISOString(),
        syncError: message.slice(0, 500),
        syncStatus: 'error',
      },
      id: repository.id,
      overrideAccess: true,
    })
    throw error
  }
}

export async function syncTrackedRepositories(
  payload: Payload,
  options: { force?: boolean; repositoryId?: number } = {},
): Promise<TrackedRepositorySyncSummary> {
  const repositories = options.repositoryId
    ? [
        await payload.findByID({
          collection: 'tracked-repositories',
          depth: 0,
          id: options.repositoryId,
          overrideAccess: true,
        }),
      ]
    : (
        await payload.find({
          collection: 'tracked-repositories',
          depth: 0,
          limit: 500,
          overrideAccess: true,
          pagination: false,
          sort: 'nextSyncAt',
          where: options.force
            ? { enabled: { equals: true } }
            : {
                and: [
                  { enabled: { equals: true } },
                  { nextSyncAt: { less_than_equal: new Date().toISOString() } },
                ],
              },
        })
      ).docs

  const summary: TrackedRepositorySyncSummary = {
    cached: 0,
    contributionsCreated: 0,
    contributionsUpdated: 0,
    failed: 0,
    repositoriesSynced: 0,
  }

  // Keep GitHub calls sequential to avoid secondary rate-limit bursts.
  for (const repository of repositories) {
    try {
      const result = await syncTrackedRepository(payload, repository, { force: options.force })
      if (result.cached) {
        summary.cached += 1
      } else {
        summary.repositoriesSynced += 1
        summary.contributionsCreated += result.created
        summary.contributionsUpdated += result.updated
      }
    } catch (error) {
      summary.failed += 1
      payload.logger.error({
        err: error,
        msg: `Unable to sync tracked repository ${repository.repoKey}`,
      })
    }
  }

  if (summary.contributionsCreated || summary.contributionsUpdated) {
    scheduleRevalidation(['/contributions', '/sitemap.xml'])
  }

  return summary
}
