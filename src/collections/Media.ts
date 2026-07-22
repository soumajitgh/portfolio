import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
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
