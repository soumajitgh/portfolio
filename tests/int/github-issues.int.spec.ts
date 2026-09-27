import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { User } from '@/payload-types'

let payload: Payload
let admin: User

describe('GitHub issue tracking collections', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
    admin = await payload.create({
      collection: 'users',
      data: {
        email: `issue-tracker-${Date.now()}@example.com`,
        password: 'test-password',
      },
      overrideAccess: true,
    })
  })

  afterAll(async () => {
    if (admin?.id) {
      await payload.delete({ collection: 'users', id: admin.id, overrideAccess: true })
    }
  })

  it('enforces admin access and protects synchronized fields from manual edits', async () => {
    let trackerID: number | undefined
    const queuedJobIDs: number[] = []

    try {
      const tracker = await payload.create({
        collection: 'issue-trackers',
        data: {
          authorFilter: 'member',
          enabled: false,
          repositoryUrl: 'https://www.github.com/Example-Owner/issue-security-test.git/',
          syncIntervalHours: 6,
        } as never,
        overrideAccess: false,
        user: admin,
      })
      trackerID = tracker.id

      expect(tracker).toMatchObject({
        authorFilter: 'member',
        organization: 'Example-Owner',
        repoKey: 'example-owner/issue-security-test',
        repository: 'issue-security-test',
        repositoryUrl: 'https://github.com/Example-Owner/issue-security-test',
        syncStatus: 'pending',
      })

      await expect(
        payload.create({
          collection: 'issue-trackers',
          data: { repositoryUrl: 'https://github.com/example-owner/issue-security-test' } as never,
          overrideAccess: false,
          user: admin,
        }),
      ).rejects.toThrow()

      await expect(
        payload.create({
          collection: 'issue-trackers',
          data: {
            repositoryUrl: 'https://github.com/example-owner/invalid-interval-test',
            syncIntervalHours: 25,
          } as never,
          overrideAccess: false,
          user: admin,
        }),
      ).rejects.toThrow()

      const trackedIssue = await payload.create({
        collection: 'tracked-issues',
        data: {
          assignees: ['maintainer'],
          author: 'octocat',
          authorAssociation: 'MEMBER',
          body: 'Original body',
          commentCount: 1,
          githubCreatedAt: '2026-09-27T12:00:01.000Z',
          githubNodeId: `I_security_${tracker.id}`,
          githubState: 'open',
          githubUpdatedAt: '2026-09-27T12:00:02.000Z',
          issueKey: `example-owner/issue-security-test#${tracker.id}`,
          issueNumber: tracker.id,
          issueTracker: tracker.id,
          issueUrl: `https://github.com/example-owner/issue-security-test/issues/${tracker.id}`,
          labels: [{ name: 'bug' }],
          organization: 'Example-Owner',
          repository: 'issue-security-test',
          status: 'new',
          title: 'Worker supplied title',
        },
        overrideAccess: true,
      })

      await expect(
        payload.create({
          collection: 'tracked-issues',
          data: { status: 'new' } as never,
          overrideAccess: false,
          user: admin,
        }),
      ).rejects.toThrow()

      const edited = await payload.update({
        collection: 'tracked-issues',
        data: {
          githubState: 'closed',
          notes: 'Keep for the roadmap',
          status: 'saved',
          title: 'Manual overwrite attempt',
        },
        id: trackedIssue.id,
        overrideAccess: false,
        user: admin,
      })
      expect(edited).toMatchObject({
        githubState: 'open',
        notes: 'Keep for the roadmap',
        status: 'saved',
        title: 'Worker supplied title',
      })

      await expect(
        payload.find({
          collection: 'tracked-issues',
          overrideAccess: false,
          pagination: false,
          user: null,
          where: { id: { equals: trackedIssue.id } },
        }),
      ).rejects.toThrow(/not allowed/i)

      const previousWindow = await payload.update({
        collection: 'issue-trackers',
        context: { skipIssueTrackerSync: true },
        data: {
          lastSyncedAt: '2026-01-01T01:00:00.000Z',
          trackingStartedAt: '2026-01-01T00:00:00.000Z',
        },
        id: tracker.id,
        overrideAccess: true,
      })
      const reEnabled = await payload.update({
        collection: 'issue-trackers',
        data: { enabled: true },
        id: tracker.id,
        overrideAccess: false,
        user: admin,
      })
      expect(reEnabled.lastSyncedAt).toBeNull()
      expect(new Date(reEnabled.trackingStartedAt).getTime()).toBeGreaterThan(
        new Date(previousWindow.trackingStartedAt).getTime(),
      )

      const jobs = await payload.find({
        collection: 'payload-jobs',
        depth: 0,
        limit: 20,
        overrideAccess: true,
        pagination: false,
        where: { taskSlug: { equals: 'syncIssueTrackers' } },
      })
      for (const job of jobs.docs) {
        if ((job.input as { trackerId?: number } | null)?.trackerId === tracker.id) {
          queuedJobIDs.push(job.id)
        }
      }
      expect(queuedJobIDs.length).toBeGreaterThan(0)

      await payload.delete({
        collection: 'issue-trackers',
        id: tracker.id,
        overrideAccess: false,
        user: admin,
      })
      trackerID = undefined

      const deletedIssue = await payload.find({
        collection: 'tracked-issues',
        overrideAccess: true,
        pagination: false,
        where: { id: { equals: trackedIssue.id } },
      })
      expect(deletedIssue.totalDocs).toBe(0)
    } finally {
      for (const id of queuedJobIDs) {
        await payload.delete({ collection: 'payload-jobs', id, overrideAccess: true })
      }
      if (trackerID) {
        await payload.delete({
          collection: 'issue-trackers',
          context: { skipIssueTrackerSync: true },
          id: trackerID,
          overrideAccess: true,
        })
      }
    }
  })
})
