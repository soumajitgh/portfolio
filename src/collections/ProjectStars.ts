import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/lib/admin'

export const ProjectStars: CollectionConfig = {
  slug: 'project-stars',
  labels: {
    plural: 'Project stars',
    singular: 'Project star',
  },
  admin: {
    description: 'Anonymous appreciation events recorded for portfolio projects.',
    group: adminGroups.engagement,
    useAsTitle: 'visitorHash',
    defaultColumns: ['project', 'createdAt'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: () => false,
  },
  disableDuplicate: true,
  indexes: [{ fields: ['project', 'visitorHash'], unique: true }],
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'visitorHash',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
  ],
}
