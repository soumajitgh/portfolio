import { revalidatePath } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { skillCategories, validateWebURL } from '@/lib/content'

const actionFields = [
  { name: 'label', type: 'text' as const, required: true },
  {
    name: 'url',
    type: 'text' as const,
    required: true,
    validate: (value: unknown) => validateWebURL(value as string),
  },
]

export const PortfolioSettings: GlobalConfig = {
  slug: 'portfolio-settings',
  label: 'Portfolio settings',
  admin: { group: 'Portfolio' },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [
      ({ context, doc }) => {
        if (context.disableRevalidate) return doc
        revalidatePath('/')
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'heroCommand',
      type: 'text',
      required: true,
      defaultValue: 'soumajit@portfolio:~$ whoami',
    },
    { name: 'heroHeadline', type: 'text', required: true },
    { name: 'heroDescription', type: 'textarea', required: true, maxLength: 320 },
    { name: 'primaryAction', type: 'group', fields: actionFields },
    { name: 'secondaryAction', type: 'group', fields: actionFields },
    {
      name: 'interests',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
      ],
    },
    {
      name: 'skills',
      type: 'array',
      fields: [
        { name: 'category', type: 'select', required: true, options: [...skillCategories] },
        {
          name: 'items',
          type: 'array',
          required: true,
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'proficiency', type: 'text' },
            { name: 'icon', type: 'text' },
            {
              name: 'link',
              type: 'text',
              validate: (value: null | string | undefined) => validateWebURL(value),
            },
          ],
        },
      ],
    },
    {
      name: 'carouselRotationInterval',
      type: 'number',
      required: true,
      defaultValue: 7000,
      min: 3000,
      max: 30000,
      admin: { description: 'Milliseconds between automatic panel changes.' },
    },
    {
      name: 'featuredProjectOverride',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: { description: 'Optional ordered override. Leave empty to use featured projects.' },
      filterOptions: { _status: { equals: 'published' } },
    },
  ],
}
