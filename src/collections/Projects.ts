import { revalidatePath } from 'next/cache'
import type { CollectionConfig } from 'payload'

import {
  accentOptions,
  projectCategories,
  projectStatuses,
  slugify,
  validateWebURL,
} from '@/lib/content'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    group: 'Portfolio',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'featured', 'pinned', 'publishedAt'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    update: ({ req }) => Boolean(req.user),
  },
  defaultSort: ['-pinned', 'displayOrder', '-publishedAt'],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data

        if (!data.slug && data.title) data.slug = slugify(data.title)

        if (Array.isArray(data.topics)) {
          const seen = new Set<string>()
          data.topics = data.topics
            .map((topic: { name?: string; slug?: string }) => {
              const name = topic.name?.trim()
              const slug = slugify(topic.slug || name || '')
              return name && slug ? { ...topic, name: name.toLowerCase(), slug } : null
            })
            .filter((topic: { slug: string } | null) => {
              if (!topic || seen.has(topic.slug)) return false
              seen.add(topic.slug)
              return true
            })
        }

        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (data._status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        await req.payload.delete({
          collection: 'project-stars',
          overrideAccess: true,
          req,
          where: { project: { equals: id } },
        })
      },
    ],
    afterChange: [
      ({ context, doc, previousDoc }) => {
        if (context.disableRevalidate) return doc
        revalidatePath('/')
        revalidatePath('/projects')
        if (doc.slug) revalidatePath(`/projects/${doc.slug}`)
        if (previousDoc?.slug && previousDoc.slug !== doc.slug) {
          revalidatePath(`/projects/${previousDoc.slug}`)
        }
        return doc
      },
    ],
    afterDelete: [
      ({ context, doc }) => {
        if (context.disableRevalidate) return doc
        revalidatePath('/')
        revalidatePath('/projects')
        if (doc?.slug) revalidatePath(`/projects/${doc.slug}`)
        return doc
      },
    ],
  },
  versions: {
    drafts: {
      autosave: true,
      validate: false,
    },
    maxPerDoc: 30,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [({ value }) => (typeof value === 'string' ? slugify(value) : value)],
      },
    },
    { name: 'shortDescription', type: 'textarea', required: true, maxLength: 260 },
    { name: 'category', type: 'select', required: true, options: [...projectCategories] },
    { name: 'overview', type: 'richText', required: true },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'media', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: (value: null | string | undefined) => validateWebURL(value),
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: ['github', 'demo', 'documentation', 'package', 'article', 'custom'],
        },
      ],
    },
    {
      name: 'topics',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, index: true },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'status', type: 'select', required: true, options: [...projectStatuses] },
        { name: 'accent', type: 'select', defaultValue: 'blue', options: [...accentOptions] },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'featured', type: 'checkbox', defaultValue: false },
        { name: 'pinned', type: 'checkbox', defaultValue: false },
        { name: 'displayOrder', type: 'number', defaultValue: 100, min: 0 },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'projectYear', type: 'number', min: 1990, max: 2100 },
        {
          name: 'publishedAt',
          type: 'date',
          admin: { date: { pickerAppearance: 'dayAndTime' } },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'repositoryOwner', type: 'text' },
        { name: 'repositoryName', type: 'text' },
      ],
    },
  ],
}
