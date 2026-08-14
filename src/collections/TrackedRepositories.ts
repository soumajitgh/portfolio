import { APIError, type CollectionConfig } from 'payload'

import { getExpectedGitHubUsername, parseGitHubRepositoryURL } from '@/lib/github-contributions'

export const TrackedRepositories: CollectionConfig = {
  slug: 'tracked-repositories',
  labels: {
    plural: 'Tracked Repositories',
    singular: 'Tracked Repository',
  },
  typescript: {
    interface: 'TrackedRepository',
  },
  admin: {
    group: 'Portfolio',
    useAsTitle: 'repoKey',
    defaultColumns: [
      'repoKey',
      'githubUsername',
      'enabled',
      'syncStatus',
      'lastSyncedAt',
      'nextSyncAt',
    ],
    description:
      'Add a GitHub repository once. Pull requests opened by the configured username are discovered and refreshed automatically.',
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  disableDuplicate: true,
  hooks: {
    beforeValidate: [
      ({ context, data, operation, originalDoc }) => {
        if (!data || context.skipRepositorySync) return data

        let parsed
        try {
          parsed = parseGitHubRepositoryURL(data.repositoryUrl ?? originalDoc?.repositoryUrl)
        } catch (error) {
          throw new APIError(error instanceof Error ? error.message : 'Invalid GitHub URL.', 400)
        }

        const repositoryChanged = operation === 'create' || parsed.key !== originalDoc?.repoKey
        const githubUsername = String(
          data.githubUsername ?? originalDoc?.githubUsername ?? getExpectedGitHubUsername(),
        ).trim()

        if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(githubUsername)) {
          throw new APIError('Enter a valid GitHub username.', 400)
        }

        Object.assign(data, {
          githubUsername,
          organization: parsed.owner,
          repoKey: parsed.key,
          repository: parsed.repo,
          repositoryUrl: parsed.url,
        })

        const usernameChanged =
          operation === 'create' ||
          githubUsername.toLowerCase() !== originalDoc?.githubUsername?.toLowerCase()

        if (repositoryChanged || usernameChanged) {
          data.nextSyncAt = new Date(0).toISOString()
          data.syncError = null
          data.syncStatus = 'pending'
        }

        return data
      },
    ],
    afterChange: [
      async ({ context, doc, operation, previousDoc, req }) => {
        if (context.skipRepositorySync) return doc

        const settingsChanged =
          operation === 'create' ||
          doc.repoKey !== previousDoc?.repoKey ||
          doc.githubUsername !== previousDoc?.githubUsername
        const force = doc.refreshNow === true

        if ((settingsChanged || force) && doc.enabled !== false) {
          await req.payload.jobs.queue({
            input: { force, repositoryId: doc.id },
            queue: 'github-contributions',
            req,
            task: 'syncTrackedRepositories',
          })
        }

        if (force) {
          await req.payload.update({
            collection: 'tracked-repositories',
            context: { skipRepositorySync: true },
            data: { refreshNow: false },
            id: doc.id,
            overrideAccess: true,
            req,
          })
        }

        return doc
      },
    ],
  },
  fields: [
    {
      name: 'repositoryUrl',
      label: 'GitHub repository URL',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Paste a repository URL like https://github.com/OneBusAway/maglev.',
        placeholder: 'https://github.com/org/repo',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'githubUsername',
          label: 'PR author',
          type: 'text',
          required: true,
          defaultValue: getExpectedGitHubUsername(),
          admin: {
            description: 'Only pull requests opened by this GitHub account are imported.',
          },
        },
        {
          name: 'syncIntervalHours',
          label: 'Sync interval (hours)',
          type: 'number',
          required: true,
          defaultValue: 2,
          min: 1,
          max: 24,
          admin: {
            description: 'Automatic runs skip this repository until its cache expires.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'refreshNow',
          label: 'Refresh now',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Bypasses the two-hour cache once when this document is saved.',
          },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Repository',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'organization', type: 'text', required: true, admin: { readOnly: true } },
                { name: 'repository', type: 'text', required: true, admin: { readOnly: true } },
              ],
            },
            {
              name: 'repoDescription',
              label: 'Description',
              type: 'textarea',
              admin: { readOnly: true },
            },
            {
              type: 'row',
              fields: [
                { name: 'stars', type: 'number', min: 0, admin: { readOnly: true } },
                {
                  name: 'discoveredPullRequests',
                  label: 'Discovered PRs',
                  type: 'number',
                  min: 0,
                  defaultValue: 0,
                  admin: { readOnly: true },
                },
              ],
            },
          ],
        },
        {
          label: 'Sync',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'syncStatus',
                  type: 'select',
                  required: true,
                  defaultValue: 'pending',
                  options: ['pending', 'syncing', 'synced', 'error'],
                  admin: { readOnly: true },
                },
                {
                  name: 'nextSyncAt',
                  label: 'Cache expires / next sync',
                  type: 'date',
                  required: true,
                  defaultValue: () => new Date(0).toISOString(),
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'lastSyncAttemptAt',
                  label: 'Last attempt',
                  type: 'date',
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
                {
                  name: 'lastSyncedAt',
                  label: 'Last successful sync',
                  type: 'date',
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
              ],
            },
            {
              name: 'syncError',
              label: 'Last sync error',
              type: 'textarea',
              maxLength: 500,
              admin: { readOnly: true },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'githubRequestsLastSync',
                  label: 'GitHub requests in last sync',
                  type: 'number',
                  min: 0,
                  defaultValue: 0,
                  admin: { readOnly: true },
                },
                {
                  name: 'githubRateLimitRemaining',
                  label: 'GitHub rate limit remaining',
                  type: 'number',
                  min: 0,
                  admin: { readOnly: true },
                },
                {
                  name: 'githubRateLimitResetAt',
                  label: 'GitHub rate limit reset',
                  type: 'date',
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'repoKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { hidden: true },
    },
  ],
}
