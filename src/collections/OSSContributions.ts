import { APIError, type CollectionConfig } from 'payload'

import {
  fetchGitHubContribution,
  getExpectedGitHubUsername,
  GitHubContributionUnavailableError,
  parseGitHubPullRequestURL,
} from '@/lib/github-contributions'
import { scheduleRevalidation } from '@/lib/revalidation'
import { slugify } from '@/lib/content'

const githubMetadataFields = [
  'title',
  'prNumber',
  'repository',
  'organization',
  'author',
  'status',
  'prCreatedAt',
  'mergedAt',
  'additions',
  'deletions',
  'changedFiles',
  'prDescription',
  'repoUrl',
  'repoDescription',
  'stars',
] as const

const copyGitHubMetadata = (target: Record<string, unknown>, source?: Record<string, unknown>) => {
  if (!source) return
  for (const field of githubMetadataFields) target[field] = source[field]
  target.prKey = source.prKey
  target.prUrl = source.prUrl
}

export const OSSContributions: CollectionConfig = {
  slug: 'oss-contributions',
  labels: {
    plural: 'OSS Contributions',
    singular: 'OSS Contribution',
  },
  typescript: {
    interface: 'OSSContribution',
  },
  admin: {
    group: 'Portfolio',
    useAsTitle: 'title',
    defaultColumns: ['title', 'repository', 'status', 'featured', 'hidden', 'githubSyncedAt'],
    description:
      'Paste a GitHub pull request URL. GitHub facts are imported automatically; portfolio fields stay under your control.',
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => (req.user ? true : { hidden: { not_equals: true } }),
    update: ({ req }) => Boolean(req.user),
  },
  defaultSort: ['-featured', 'displayOrder', '-mergedAt', '-prCreatedAt'],
  disableDuplicate: true,
  hooks: {
    beforeValidate: [
      async ({ context, data, operation, originalDoc, req }) => {
        if (!data) return data

        if (Array.isArray(data.tags)) {
          const seen = new Set<string>()
          data.tags = data.tags
            .map((tag: { name?: string; slug?: string }) => {
              const name = tag.name?.trim()
              const slug = slugify(tag.slug || name || '')
              return name && slug ? { ...tag, name, slug } : null
            })
            .filter((tag: { slug: string } | null) => {
              if (!tag || seen.has(tag.slug)) return false
              seen.add(tag.slug)
              return true
            })
        }

        // Development seeds provide deterministic fixtures and must not depend on
        // GitHub availability or consume API rate limits.
        if (context.skipGitHubSync) {
          data.refreshFromGitHub = false
          return data
        }

        let parsed
        try {
          parsed = parseGitHubPullRequestURL(data.prUrl ?? originalDoc?.prUrl)
        } catch (error) {
          throw new APIError(error instanceof Error ? error.message : 'Invalid GitHub URL.', 400)
        }

        const urlChanged = operation === 'create' || parsed.key !== originalDoc?.prKey
        const shouldSync = urlChanged || data.refreshFromGitHub === true

        if (!shouldSync) {
          copyGitHubMetadata(data, originalDoc)
          data.githubSyncedAt = originalDoc?.githubSyncedAt
          data.githubSyncStatus = originalDoc?.githubSyncStatus
          data.githubSyncError = originalDoc?.githubSyncError
          data.refreshFromGitHub = false
          return data
        }

        const duplicate = await req.payload.find({
          collection: 'oss-contributions',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          pagination: false,
          where: { prKey: { equals: parsed.key } },
        })

        if (duplicate.docs.some((contribution) => contribution.id !== originalDoc?.id)) {
          throw new APIError('This pull request is already in your contributions.', 409)
        }

        let metadata
        try {
          metadata = await fetchGitHubContribution(parsed)
        } catch (error) {
          if (
            operation === 'create' ||
            urlChanged ||
            !(error instanceof GitHubContributionUnavailableError)
          ) {
            throw new APIError(
              error instanceof Error ? error.message : 'Unable to import this pull request.',
              400,
            )
          }

          copyGitHubMetadata(data, originalDoc)
          data.githubSyncStatus = 'unavailable'
          data.githubSyncError = error.message.slice(0, 500)
          data.refreshFromGitHub = false
          return data
        }

        const expectedAuthor = getExpectedGitHubUsername()
        const allowDifferentAuthor = Boolean(
          data.allowDifferentAuthor ?? originalDoc?.allowDifferentAuthor,
        )
        if (
          expectedAuthor &&
          metadata.author.toLowerCase() !== expectedAuthor.toLowerCase() &&
          !allowDifferentAuthor
        ) {
          throw new APIError(
            `This PR was opened by ${metadata.author}, not ${expectedAuthor}. Enable the author override to import it.`,
            400,
          )
        }

        Object.assign(data, metadata, {
          githubSyncedAt: new Date().toISOString(),
          githubSyncError: null,
          githubSyncStatus: 'synced',
          refreshFromGitHub: false,
        })

        return data
      },
    ],
    afterChange: [
      ({ context, doc }) => {
        if (!context.disableRevalidate) scheduleRevalidation(['/contributions', '/sitemap.xml'])
        return doc
      },
    ],
    afterDelete: [
      ({ context, doc }) => {
        if (!context.disableRevalidate) scheduleRevalidation(['/contributions', '/sitemap.xml'])
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'prUrl',
      label: 'GitHub pull request URL',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Paste a URL like https://github.com/org/repo/pull/123.',
        placeholder: 'https://github.com/org/repo/pull/123',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'allowDifferentAuthor',
          label: 'Allow a different PR author',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: `Bypasses the ${getExpectedGitHubUsername()} ownership check for co-authored or maintainer-opened PRs.`,
          },
        },
        {
          name: 'refreshFromGitHub',
          label: 'Refresh from GitHub on save',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description:
              'Re-fetch factual metadata without changing your portfolio summary, tags, or visibility.',
          },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Portfolio',
          fields: [
            {
              name: 'portfolioSummary',
              type: 'textarea',
              maxLength: 400,
              admin: {
                description:
                  'Explain your contribution and its impact. The PR title is used as the public fallback.',
              },
            },
            {
              name: 'tags',
              type: 'array',
              maxRows: 12,
              fields: [
                { name: 'name', type: 'text', required: true },
                { name: 'slug', type: 'text', required: true, admin: { readOnly: true } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'featured', type: 'checkbox', defaultValue: false },
                { name: 'hidden', type: 'checkbox', defaultValue: false },
                { name: 'displayOrder', type: 'number', defaultValue: 100, min: 0 },
              ],
            },
          ],
        },
        {
          label: 'GitHub PR',
          fields: [
            { name: 'title', type: 'text', required: true, admin: { readOnly: true } },
            {
              type: 'row',
              fields: [
                {
                  name: 'prNumber',
                  label: 'PR number',
                  type: 'number',
                  required: true,
                  admin: { readOnly: true },
                },
                { name: 'author', type: 'text', required: true, admin: { readOnly: true } },
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  options: ['open', 'closed', 'merged'],
                  admin: { readOnly: true },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'prCreatedAt',
                  label: 'PR created at',
                  type: 'date',
                  required: true,
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
                {
                  name: 'mergedAt',
                  type: 'date',
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'additions',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: { readOnly: true },
                },
                {
                  name: 'deletions',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: { readOnly: true },
                },
                {
                  name: 'changedFiles',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: { readOnly: true },
                },
              ],
            },
            {
              name: 'prDescription',
              label: 'PR description',
              type: 'textarea',
              admin: { readOnly: true },
            },
          ],
        },
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
              name: 'repoUrl',
              label: 'Repository URL',
              type: 'text',
              required: true,
              admin: { readOnly: true },
            },
            {
              name: 'repoDescription',
              label: 'Repository description',
              type: 'textarea',
              admin: { readOnly: true },
            },
            { name: 'stars', type: 'number', required: true, min: 0, admin: { readOnly: true } },
          ],
        },
        {
          label: 'Sync',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'githubSyncStatus',
                  label: 'GitHub sync status',
                  type: 'select',
                  required: true,
                  options: ['synced', 'unavailable'],
                  admin: { readOnly: true },
                },
                {
                  name: 'githubSyncedAt',
                  label: 'Last GitHub sync',
                  type: 'date',
                  required: true,
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
              ],
            },
            {
              name: 'githubSyncError',
              label: 'Last sync error',
              type: 'textarea',
              maxLength: 500,
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
    {
      name: 'prKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { hidden: true },
    },
  ],
}
