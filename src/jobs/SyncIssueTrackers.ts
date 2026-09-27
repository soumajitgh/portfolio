import type { TaskConfig } from 'payload'

import { syncIssueTrackers } from '@/lib/issue-tracker-sync'

type SyncIssueTrackersTask = {
  input: {
    force?: boolean
    trackerId?: number
  }
  output: {
    cached: number
    failed: number
    issuesCreated: number
    issuesUpdated: number
    trackersSynced: number
  }
}

export const SyncIssueTrackers: TaskConfig<SyncIssueTrackersTask> = {
  slug: 'syncIssueTrackers',
  label: 'Sync tracked GitHub issues',
  concurrency: {
    exclusive: true,
    key: () => 'github-issues',
  },
  inputSchema: [
    { name: 'trackerId', type: 'number' },
    { name: 'force', type: 'checkbox' },
  ],
  outputSchema: [
    { name: 'cached', type: 'number', required: true },
    { name: 'failed', type: 'number', required: true },
    { name: 'issuesCreated', type: 'number', required: true },
    { name: 'issuesUpdated', type: 'number', required: true },
    { name: 'trackersSynced', type: 'number', required: true },
  ],
  retries: {
    attempts: 2,
    backoff: { delay: 60_000, type: 'exponential' },
  },
  schedule: [{ cron: '*/15 * * * *', queue: 'github-issues' }],
  handler: async ({ input, req }) => {
    const output = await syncIssueTrackers(req.payload, {
      force: input.force,
      trackerId: input.trackerId,
    })
    return { output }
  },
}
