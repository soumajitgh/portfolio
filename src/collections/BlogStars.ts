import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/lib/admin'

export const BlogStars: CollectionConfig = {
  slug: 'blog-stars',
  labels: {
    plural: 'Blog stars',
    singular: 'Blog star',
  },
  admin: {
    description: 'Anonymous appreciation events recorded for blog posts.',
    group: adminGroups.engagement,
    useAsTitle: 'visitorHash',
    defaultColumns: ['blogPost', 'createdAt'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: () => false,
  },
  disableDuplicate: true,
  indexes: [{ fields: ['blogPost', 'visitorHash'], unique: true }],
  fields: [
    {
      name: 'blogPost',
      type: 'relationship',
      relationTo: 'blog-posts',
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
