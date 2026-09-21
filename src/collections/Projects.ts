import type { CollectionConfig } from 'payload'

import {
  accentOptions,
  projectCategories,
  projectStatuses,
  slugify,
  validateWebURL,
} from '@/lib/content'
import { scheduleRevalidation } from '@/lib/revalidation'
import { adminGroups } from '@/lib/admin'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    group: adminGroups.content,
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'featured', 'pinned', 'publishedAt'],
    description: 'Create and curate the projects shown across the portfolio.',
    listSearchableFields: ['title', 'slug', 'shortDescription'],
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

        const paths: string[] = []
        if (doc._status === 'published') {
          paths.push('/', '/projects', '/sitemap.xml', `/projects/${doc.slug}`)
        }
        if (
          previousDoc?._status === 'published' &&
          (doc._status !== 'published' || previousDoc.slug !== doc.slug)
        ) {
          paths.push('/', '/projects', '/sitemap.xml', `/projects/${previousDoc.slug}`)
        }
        scheduleRevalidation(paths)

        return doc
      },
    ],
    afterDelete: [
      ({ context, doc }) => {
        if (context.disableRevalidate || doc._status !== 'published') return doc
        scheduleRevalidation(['/', '/projects', '/sitemap.xml', `/projects/${doc.slug}`])
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
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Overview',
          admin: { description: 'Core project information and the long-form case study.' },
          fields: [
            { name: 'title', type: 'text', required: true },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              hooks: {
                beforeValidate: [
                  ({ value }) => (typeof value === 'string' ? slugify(value) : value),
                ],
              },
            },
            { name: 'shortDescription', type: 'textarea', required: true, maxLength: 260 },
            { name: 'category', type: 'select', required: true, options: [...projectCategories] },
            { name: 'overview', type: 'richText', required: true },
          ],
        },
        {
          label: 'Media & links',
          admin: {
            description: 'Cover art, gallery assets, external destinations, and topic tags.',
          },
          fields: [
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
          ],
        },
        {
          label: 'Publishing',
          admin: { description: 'Visibility, display order, dates, and repository metadata.' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  type: 'select',
                  enumName: 'enum_projects_lifecycle_status',
                  required: true,
                  options: [...projectStatuses],
                },
                {
                  name: 'accent',
                  type: 'select',
                  defaultValue: 'blue',
                  options: [...accentOptions],
                },
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
        },
        {
          label: 'SEO',
          admin: { description: 'Optional search and social sharing overrides.' },
          fields: [
            {
              name: 'seo',
              type: 'group',
              admin: {
                description:
                  'The project title, description, and cover image are used as fallbacks.',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  maxLength: 70,
                  admin: {
                    description: 'Aim for 50–60 characters and describe what the project does.',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  maxLength: 180,
                  admin: {
                    description: 'Aim for 140–160 characters with the main technology or outcome.',
                  },
                },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  filterOptions: {
                    mimeType: { contains: 'image' },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
