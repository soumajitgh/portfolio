import type { TaskConfig } from 'payload'

import { syncTrackedRepositories } from '@/lib/tracked-repository-sync'

type SyncTrackedRepositoriesTask = {
  input: {
    force?: boolean
    repositoryId?: number
  }
  output: {
    cached: number
    contributionsCreated: number
    contributionsUpdated: number
    failed: number
    repositoriesSynced: number
  }
}

export const SyncTrackedRepositories: TaskConfig<SyncTrackedRepositoriesTask> = {
  slug: 'syncTrackedRepositories',
  label: 'Sync tracked GitHub repositories',
  concurrency: {
    exclusive: true,
    key: () => 'github-contributions',
  },
  inputSchema: [
    { name: 'repositoryId', type: 'number' },
    { name: 'force', type: 'checkbox' },
  ],
  outputSchema: [
    { name: 'cached', type: 'number', required: true },
    { name: 'contributionsCreated', type: 'number', required: true },
    { name: 'contributionsUpdated', type: 'number', required: true },
    { name: 'failed', type: 'number', required: true },
    { name: 'repositoriesSynced', type: 'number', required: true },
  ],
  retries: {
    attempts: 2,
    backoff: { delay: 60_000, type: 'exponential' },
  },
  // Poll the database frequently, but the per-repository nextSyncAt cache means
  // GitHub is contacted only when its default two-hour window has expired.
  schedule: [{ cron: '*/15 * * * *', queue: 'github-contributions' }],
  handler: async ({ input, req }) => {
    const output = await syncTrackedRepositories(req.payload, {
      force: input.force,
      repositoryId: input.repositoryId,
    })
    return { output }
  },
}
