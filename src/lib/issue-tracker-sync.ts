import type { Payload } from 'payload'

import {
  associationMatches,
  fetchGitHubIssues,
  GitHubIssuesUnavailableError,
  type IssueAuthorFilter,
} from '@/lib/github-issues'

const DEFAULT_SYNC_INTERVAL_HOURS = 6
const ERROR_RETRY_DELAY_MS = 30 * 60 * 1000
const CURSOR_OVERLAP_MS = 2 * 60 * 1000

type IssueTrackerRecord = {
  authorFilter: IssueAuthorFilter
  enabled?: boolean | null
  id: number
  lastSyncedAt?: null | string
  nextSyncAt: string
  organization: string
  repository: string
  repoKey: string
  syncIntervalHours?: null | number
  trackingStartedAt: string
}

type TrackerSyncResult = {
  cached: boolean
  created: number
  trackerId: number
  updated: number
}

export type IssueTrackerSyncSummary = {
  cached: number
  failed: number
  issuesCreated: number
  issuesUpdated: number
  trackersSynced: number
}

function nextSyncDate(now: Date, intervalHours?: null | number) {
  const hours = Math.min(24, Math.max(1, intervalHours || DEFAULT_SYNC_INTERVAL_HOURS))
  return new Date(now.getTime() + hours * 60 * 60 * 1000)
}

export function issueSyncCursor(
  tracker: Pick<IssueTrackerRecord, 'lastSyncedAt' | 'trackingStartedAt'>,
) {
  const cursor = new Date(tracker.lastSyncedAt || tracker.trackingStartedAt)
  return new Date(cursor.getTime() - CURSOR_OVERLAP_MS)
}

function retryDate(now: Date, error: unknown) {
  if (error instanceof GitHubIssuesUnavailableError && error.retryAt) {
    const reset = new Date(error.retryAt)
    if (!Number.isNaN(reset.getTime()) && reset > now) return reset
  }
  return new Date(now.getTime() + ERROR_RETRY_DELAY_MS)
}

async function findExistingIssue(payload: Payload, githubNodeId: string, issueKey: string) {
  const existing = await payload.find({
    collection: 'tracked-issues',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      or: [{ githubNodeId: { equals: githubNodeId } }, { issueKey: { equals: issueKey } }],
    },
  })
  return existing.docs[0]
}

export async function syncIssueTracker(
  payload: Payload,
  tracker: IssueTrackerRecord,
  options: { force?: boolean; now?: Date } = {},
): Promise<TrackerSyncResult> {
  const now = options.now || new Date()
  const nowISO = now.toISOString()

  if (tracker.enabled === false) {
    return { cached: true, created: 0, trackerId: tracker.id, updated: 0 }
  }
  if (!options.force && new Date(tracker.nextSyncAt).getTime() > now.getTime()) {
    return { cached: true, created: 0, trackerId: tracker.id, updated: 0 }
  }

  await payload.update({
    collection: 'issue-trackers',
    context: { skipIssueTrackerSync: true },
    data: { lastSyncAttemptAt: nowISO, syncError: null, syncStatus: 'syncing' },
    id: tracker.id,
    overrideAccess: true,
  })

  try {
    const snapshot = await fetchGitHubIssues({
      owner: tracker.organization,
      repository: tracker.repository,
      since: issueSyncCursor(tracker),
    })
    const trackingStartedAt = new Date(tracker.trackingStartedAt).getTime()
    let created = 0
    let updated = 0

    for (const issue of snapshot.issues) {
      const existing = await findExistingIssue(payload, issue.githubNodeId, issue.issueKey)
      const syncData = {
        ...issue,
        issueTracker: tracker.id,
        organization: tracker.organization,
        repository: tracker.repository,
      }

      if (existing) {
        await payload.update({
          collection: 'tracked-issues',
          data: syncData,
          id: existing.id,
          overrideAccess: true,
        })
        updated += 1
        continue
      }

      const createdAt = new Date(issue.githubCreatedAt).getTime()
      if (
        createdAt <= trackingStartedAt ||
        !associationMatches(tracker.authorFilter, issue.authorAssociation)
      ) {
        continue
      }

      await payload.create({
        collection: 'tracked-issues',
        data: { ...syncData, status: 'new' },
        overrideAccess: true,
      })
      created += 1
    }

    const discovered = await payload.count({
      collection: 'tracked-issues',
      overrideAccess: true,
      where: { issueTracker: { equals: tracker.id } },
    })

    // The cursor advances only after every GitHub page and every upsert succeeds.
    await payload.update({
      collection: 'issue-trackers',
      context: { skipIssueTrackerSync: true },
      data: {
        discoveredIssues: discovered.totalDocs,
        githubRateLimitRemaining: snapshot.rateLimit.remaining,
        githubRateLimitResetAt: snapshot.rateLimit.resetAt,
        githubRequestsLastSync: snapshot.requestCount,
        lastSyncedAt: nowISO,
        nextSyncAt: nextSyncDate(now, tracker.syncIntervalHours).toISOString(),
        syncError: null,
        syncStatus: 'synced',
      },
      id: tracker.id,
      overrideAccess: true,
    })

    return { cached: false, created, trackerId: tracker.id, updated }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown GitHub issue sync error.'
    const rateLimitRemaining =
      error instanceof GitHubIssuesUnavailableError ? error.rateLimitRemaining : null
    const rateLimitResetAt =
      error instanceof GitHubIssuesUnavailableError ? error.retryAt || null : null

    await payload.update({
      collection: 'issue-trackers',
      context: { skipIssueTrackerSync: true },
      data: {
        githubRateLimitRemaining: rateLimitRemaining,
        githubRateLimitResetAt: rateLimitResetAt,
        nextSyncAt: retryDate(now, error).toISOString(),
        syncError: message.slice(0, 500),
        syncStatus: 'error',
      },
      id: tracker.id,
      overrideAccess: true,
    })
    throw error
  }
}

export async function syncIssueTrackers(
  payload: Payload,
  options: { force?: boolean; trackerId?: number } = {},
): Promise<IssueTrackerSyncSummary> {
  const trackers = options.trackerId
    ? [
        await payload.findByID({
          collection: 'issue-trackers',
          depth: 0,
          id: options.trackerId,
          overrideAccess: true,
        }),
      ]
    : (
        await payload.find({
          collection: 'issue-trackers',
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

  const summary: IssueTrackerSyncSummary = {
    cached: 0,
    failed: 0,
    issuesCreated: 0,
    issuesUpdated: 0,
    trackersSynced: 0,
  }

  // Sequential requests avoid GitHub secondary rate-limit bursts.
  for (const tracker of trackers as IssueTrackerRecord[]) {
    try {
      const result = await syncIssueTracker(payload, tracker, { force: options.force })
      if (result.cached) {
        summary.cached += 1
      } else {
        summary.trackersSynced += 1
        summary.issuesCreated += result.created
        summary.issuesUpdated += result.updated
      }
    } catch (error) {
      summary.failed += 1
      payload.logger.error({ err: error, msg: `Unable to sync issue tracker ${tracker.repoKey}` })
    }
  }

  return summary
}
