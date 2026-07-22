import type { CollectionConfig } from 'payload'

export const ProjectStars: CollectionConfig = {
  slug: 'project-stars',
  admin: {
    group: 'Portfolio',
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
    { name: 'project', type: 'relationship', relationTo: 'projects', required: true, index: true },
    {
      name: 'visitorHash',
      type: 'text',
      required: true,
      admin: { hidden: true },
    },
  ],
}
