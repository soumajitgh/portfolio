import type { CollectionConfig } from 'payload'

export const BlogStars: CollectionConfig = {
  slug: 'blog-stars',
  admin: {
    group: 'Portfolio',
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
    },
    {
      name: 'visitorHash',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
  ],
}
