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
        revalidatePath('/contact')
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
    {
      name: 'heroHeadline',
      type: 'textarea',
      required: true,
      maxLength: 120,
      defaultValue: 'Your request\nhas been handled.',
    },
    {
      name: 'heroDescription',
      type: 'textarea',
      required: true,
      maxLength: 320,
      defaultValue:
        'Designing fast, reliable backend systems with clean boundaries and production-grade attention to detail.',
    },
    { name: 'primaryAction', type: 'group', fields: actionFields },
    { name: 'secondaryAction', type: 'group', fields: actionFields },
    {
      name: 'resumeFile',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'PDF downloaded by the Resume button on the home page.',
      },
      filterOptions: { mimeType: { equals: 'application/pdf' } },
    },
    {
      name: 'contact',
      type: 'group',
      fields: [
        {
          name: 'email',
          type: 'email',
          required: true,
          defaultValue: 'soumojitghosh02@gmail.com',
          admin: {
            description:
              'Public contact address and fallback form recipient. CONTACT_TO_EMAIL overrides delivery.',
          },
        },
        {
          name: 'intro',
          type: 'textarea',
          required: true,
          maxLength: 320,
          defaultValue:
            'Have a backend, infrastructure, or developer tooling problem worth solving? Send the context and I will get back to you.',
        },
        {
          name: 'socials',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            {
              name: 'url',
              type: 'text',
              required: true,
              validate: (value: null | string | undefined) => validateWebURL(value),
            },
          ],
        },
      ],
    },
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
