import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/lib/admin'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'updatedAt'],
    description: 'Images and PDF documents used throughout the portfolio.',
    group: adminGroups.content,
    listSearchableFields: ['filename', 'alt', 'caption'],
    useAsTitle: 'alt',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Describe the media for screen readers and image fallbacks.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional supporting text displayed with the media.',
      },
    },
  ],
  upload: {
    focalPoint: true,
    mimeTypes: ['image/*', 'application/pdf'],
    imageSizes: [
      {
        name: 'small',
        width: 640,
      },
      {
        name: 'large',
        width: 1280,
      },
    ],
  },
}
