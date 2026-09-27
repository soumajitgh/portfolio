import type { CollectionConfig, FieldAccess } from 'payload'

import { adminGroups } from '@/lib/admin'

const internalOnly: FieldAccess = () => false
const githubFieldAccess = { create: internalOnly, update: internalOnly }

export const TrackedIssues: CollectionConfig = {
  slug: 'tracked-issues',
  labels: {
    plural: 'Tracked Issues',
    singular: 'Tracked Issue',
  },
  typescript: {
    interface: 'TrackedIssue',
  },
  admin: {
    group: adminGroups.github,
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'repository',
      'issueNumber',
      'status',
      'githubState',
      'githubUpdatedAt',
    ],
    description:
      'GitHub issue facts are synchronized automatically. Triage status and private notes stay local.',
    listSearchableFields: ['title', 'repository', 'organization', 'author', 'issueKey'],
  },
  access: {
    create: () => false,
    delete: () => false,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
  },
  defaultSort: ['status', '-githubCreatedAt'],
  disableDuplicate: true,
  fields: [
    {
      name: 'issueTracker',
      label: 'Issue tracker',
      type: 'relationship',
      relationTo: 'issue-trackers',
      required: true,
      index: true,
      access: githubFieldAccess,
      admin: { readOnly: true },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          label: 'Triage status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: ['new', 'saved', 'ignored'],
        },
        {
          name: 'githubState',
          label: 'GitHub state',
          type: 'select',
          required: true,
          options: ['open', 'closed'],
          access: githubFieldAccess,
          admin: { readOnly: true },
        },
        {
          name: 'githubStateReason',
          label: 'State reason',
          type: 'text',
          access: githubFieldAccess,
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'notes',
      label: 'Private notes',
      type: 'textarea',
      maxLength: 2000,
      admin: { description: 'Local admin-only notes; never sent to or overwritten by GitHub.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Issue',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              access: githubFieldAccess,
              admin: { readOnly: true },
            },
            {
              name: 'body',
              type: 'textarea',
              access: githubFieldAccess,
              admin: { readOnly: true },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'organization',
                  type: 'text',
                  required: true,
                  access: githubFieldAccess,
                  admin: { readOnly: true },
                },
                {
                  name: 'repository',
                  type: 'text',
                  required: true,
                  access: githubFieldAccess,
                  admin: { readOnly: true },
                },
                {
                  name: 'issueNumber',
                  label: 'Number',
                  type: 'number',
                  required: true,
                  min: 1,
                  access: githubFieldAccess,
                  admin: { readOnly: true },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'author',
                  type: 'text',
                  required: true,
                  access: githubFieldAccess,
                  admin: { readOnly: true },
                },
                {
                  name: 'authorAssociation',
                  label: 'Author association',
                  type: 'text',
                  required: true,
                  access: githubFieldAccess,
                  admin: { readOnly: true },
                },
                {
                  name: 'commentCount',
                  label: 'Comments',
                  type: 'number',
                  required: true,
                  min: 0,
                  access: githubFieldAccess,
                  admin: { readOnly: true },
                },
              ],
            },
            {
              name: 'labels',
              type: 'json',
              access: githubFieldAccess,
              admin: { readOnly: true },
            },
            {
              name: 'assignees',
              type: 'json',
              access: githubFieldAccess,
              admin: { readOnly: true },
            },
            {
              name: 'issueUrl',
              label: 'GitHub issue URL',
              type: 'text',
              required: true,
              access: githubFieldAccess,
              admin: { readOnly: true },
            },
          ],
        },
        {
          label: 'GitHub metadata',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'githubCreatedAt',
                  label: 'Created on GitHub',
                  type: 'date',
                  required: true,
                  access: githubFieldAccess,
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
                {
                  name: 'githubUpdatedAt',
                  label: 'Updated on GitHub',
                  type: 'date',
                  required: true,
                  access: githubFieldAccess,
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
                {
                  name: 'closedAt',
                  label: 'Closed on GitHub',
                  type: 'date',
                  access: githubFieldAccess,
                  admin: { date: { pickerAppearance: 'dayAndTime' }, readOnly: true },
                },
              ],
            },
            {
              name: 'githubNodeId',
              label: 'GitHub node ID',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              access: githubFieldAccess,
              admin: { readOnly: true },
            },
            {
              name: 'issueKey',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              access: githubFieldAccess,
              admin: { readOnly: true },
            },
          ],
        },
      ],
    },
  ],
}
