import { APIError, type CollectionConfig, type FieldAccess } from 'payload'

import { parseGitHubRepositoryURL } from '@/lib/github-contributions'
import { issueAuthorFilters } from '@/lib/github-issues'
import { adminGroups } from '@/lib/admin'

const internalOnly: FieldAccess = () => false

export const IssueTrackers: CollectionConfig = {
  slug: 'issue-trackers',
  labels: {
    plural: 'Issue Trackers',
    singular: 'Issue Tracker',
  },
  typescript: {
    interface: 'IssueTracker',
  },
  admin: {
    group: adminGroups.github,
    useAsTitle: 'repoKey',
    defaultColumns: [
      'repoKey',
      'authorFilter',
      'enabled',
      'syncStatus',
      'lastSyncedAt',
      'nextSyncAt',
    ],
    description:
      'Discover issues opened after tracking begins and keep their GitHub metadata synchronized.',
    listSearchableFields: ['repoKey', 'organization', 'repository'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  disableDuplicate: true,
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        await req.payload.delete({
          collection: 'tracked-issues',
          overrideAccess: true,
          req,
          where: { issueTracker: { equals: id } },
        })
      },
    ],
    beforeValidate: [
      ({ context, data, operation, originalDoc }) => {
        if (!data || context.skipIssueTrackerSync) return data

        let parsed
        try {
          parsed = parseGitHubRepositoryURL(data.repositoryUrl ?? originalDoc?.repositoryUrl)
        } catch (error) {
          throw new APIError(error instanceof Error ? error.message : 'Invalid GitHub URL.', 400)
        }

        const authorFilter = String(
          data.authorFilter ?? originalDoc?.authorFilter ?? 'all',
        ).toLowerCase()
        if (!issueAuthorFilters.includes(authorFilter as (typeof issueAuthorFilters)[number])) {
          throw new APIError('Choose a valid issue author association.', 400)
        }

        const repositoryChanged = operation === 'create' || parsed.key !== originalDoc?.repoKey
        const filterChanged = operation === 'create' || authorFilter !== originalDoc?.authorFilter
        const reEnabled =
          operation === 'update' && originalDoc?.enabled === false && data.enabled === true
        const startsNewWindow = repositoryChanged || filterChanged || reEnabled

        Object.assign(data, {
          authorFilter,
          organization: parsed.owner,
          repoKey: parsed.key,
          repository: parsed.repo,
          repositoryUrl: parsed.url,
        })

        if (startsNewWindow) {
          const now = new Date().toISOString()
          data.lastSyncedAt = null
          data.nextSyncAt = now
          data.syncError = null
          data.syncStatus = 'pending'
          data.trackingStartedAt = now
        }

        return data
      },
    ],
    afterChange: [
      async ({ context, doc, operation, previousDoc, req }) => {
        if (context.skipIssueTrackerSync) return doc

        const settingsChanged =
          operation === 'create' ||
          doc.repoKey !== previousDoc?.repoKey ||
          doc.authorFilter !== previousDoc?.authorFilter ||
          (previousDoc?.enabled === false && doc.enabled === true)
        const force = doc.refreshNow === true

        if ((settingsChanged || force) && doc.enabled !== false) {
          await req.payload.jobs.queue({
            input: { force, trackerId: doc.id },
            queue: 'github-issues',
            req,
            task: 'syncIssueTrackers',
          })
        }

        if (force) {
          await req.payload.update({
            collection: 'issue-trackers',
            context: { skipIssueTrackerSync: true },
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
        description: 'Paste a repository URL like https://github.com/payloadcms/payload.',
        placeholder: 'https://github.com/org/repo',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'authorFilter',
          label: 'Issue author association',
          type: 'select',
          required: true,
          defaultValue: 'all',
          options: [
            { label: 'Member', value: 'member' },
            { label: 'Collaborator', value: 'collaborator' },
            { label: 'Contributor', value: 'contributor' },
            { label: 'All authors', value: 'all' },
          ],
          admin: {
            description:
              'Matches GitHub author_association exactly. All also includes owners and unaffiliated users.',
          },
        },
        {
          name: 'syncIntervalHours',
          label: 'Sync interval (hours)',
          type: 'number',
          required: true,
          defaultValue: 6,
          min: 1,
          max: 24,
          admin: {
            description: 'Each tracker is checked when this interval expires.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        {
          name: 'refreshNow',
          label: 'Refresh now',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Queues one immediate sync when this document is saved.' },
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
                {
                  name: 'organization',
                  type: 'text',
                  required: true,
                  access: { create: internalOnly, update: internalOnly },
                  admin: { readOnly: true },
                },
                {
                  name: 'repository',
                  type: 'text',
                  required: true,
                  access: { create: internalOnly, update: internalOnly },
                  admin: { readOnly: true },
                },
              ],
            },
            {
              name: 'trackingStartedAt',
              label: 'Tracking window started',
              type: 'date',
              required: true,
              access: { create: internalOnly, update: internalOnly },
              admin: {
                date: { pickerAppearance: 'dayAndTime' },
                description: 'Issues created before this timestamp are never imported.',
                readOnly: true,
              },
            },
            {
              name: 'discoveredIssues',
              label: 'Discovered issues',
              type: 'number',
              min: 0,
              defaultValue: 0,
              access: { create: internalOnly, update: internalOnly },
              admin: { readOnly: true },
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
                  access: { create: internalOnly, update: internalOnly },
                  admin: { readOnly: true },
                },
                {
                  name: 'nextSyncAt',
                  label: 'Next sync',
                  type: 'date',
                  required: true,
                  defaultValue: () => new Date().toISOString(),
                  access: { create: internalOnly, update: internalOnly },
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
                  access: { create: internalOnly, update: internalOnly },
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
                {
                  name: 'lastSyncedAt',
                  label: 'Last successful sync',
                  type: 'date',
                  access: { create: internalOnly, update: internalOnly },
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
              ],
            },
            {
              name: 'syncError',
              label: 'Last sync error',
              type: 'textarea',
              maxLength: 500,
              access: { create: internalOnly, update: internalOnly },
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
                  access: { create: internalOnly, update: internalOnly },
                  admin: { readOnly: true },
                },
                {
                  name: 'githubRateLimitRemaining',
                  label: 'GitHub rate limit remaining',
                  type: 'number',
                  min: 0,
                  access: { create: internalOnly, update: internalOnly },
                  admin: { readOnly: true },
                },
                {
                  name: 'githubRateLimitResetAt',
                  label: 'GitHub rate limit reset',
                  type: 'date',
                  access: { create: internalOnly, update: internalOnly },
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
      access: { create: internalOnly, update: internalOnly },
      admin: { hidden: true },
    },
  ],
}
