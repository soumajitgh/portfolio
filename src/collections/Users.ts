import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/lib/admin'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    plural: 'Admin users',
    singular: 'Admin user',
  },
  admin: {
    description: 'People who can sign in to and manage this portfolio.',
    group: adminGroups.settings,
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    // Add more fields as needed
  ],
}
