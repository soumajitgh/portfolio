import {
  BlocksFeature,
  CodeBlock,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { CollectionConfig } from 'payload'

import { allocateBlogIssueNumber } from '@/lib/blog-issue-number'
import {
  calculateReadingMinutes,
  createExcerpt,
  lexicalToPlainText,
  normalizeBlogLabel,
  normalizeBlogSlug,
} from '@/lib/blog-content'
import { scheduleRevalidation } from '@/lib/revalidation'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizeLabels = (value: unknown) => {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.name !== 'string') return []
    const name = normalizeBlogLabel(item.name)
    if (!name || seen.has(name)) return []
    seen.add(name)
    return [{ ...item, name }]
  })
}

const invalidateBlogRoutes = (slugs: string[]) => {
  scheduleRevalidation([
    '/',
    '/blogs',
    '/rss.xml',
    '/sitemap.xml',
    ...slugs.map((slug) => `/blogs/${slug}`),
  ])
}

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  labels: {
    singular: 'Blog post',
    plural: 'Blog posts',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Portfolio',
    defaultColumns: ['title', 'issueNumber', 'featured', '_status', 'publishedAt', 'updatedAt'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    update: ({ req }) => Boolean(req.user),
  },
  defaultSort: ['-publishedAt', '-issueNumber'],
  versions: {
    drafts: {
      autosave: true,
      validate: false,
    },
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 160,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Generated from the title. Once published, changing it requires redirect support.',
      },
    },
    {
      name: 'issueNumber',
      label: 'Issue number',
      type: 'number',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Permanently assigned from the atomic blog counter.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures.filter((feature) => feature.key !== 'heading'),
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          BlocksFeature({ blocks: [CodeBlock()] }),
          EXPERIMENTAL_TableFeature(),
        ],
      }),
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 320,
      admin: {
        description: 'Optional. When empty, a summary is generated from the article body.',
      },
    },
    {
      name: 'labels',
      type: 'array',
      maxRows: 12,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'searchText',
      type: 'textarea',
      index: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'readingMinutes',
      label: 'Reading time (minutes)',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show this post in the home page Blog tab.',
      },
    },
    {
      name: 'seo',
      type: 'group',
      admin: {
        description:
          'Optional search and social overrides. The article title and excerpt are used as fallbacks.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          maxLength: 70,
          admin: {
            description: 'Aim for 50–60 characters and lead with the article topic.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          maxLength: 180,
          admin: {
            description: 'Aim for 140–160 characters and summarize the practical value.',
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
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        await req.payload.delete({
          collection: 'blog-stars',
          overrideAccess: true,
          req,
          where: { blogPost: { equals: id } },
        })
      },
    ],
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        if (!data) return data

        if (operation === 'create') {
          data.issueNumber = await allocateBlogIssueNumber(req)
        } else if (originalDoc?.issueNumber) {
          data.issueNumber = originalDoc.issueNumber
        }

        const title = typeof data.title === 'string' ? data.title : originalDoc?.title
        const requestedSlug = typeof data.slug === 'string' ? data.slug : undefined

        if (operation === 'update' && originalDoc?._status === 'published') {
          data.slug = originalDoc.slug
        } else if (requestedSlug || title) {
          data.slug = normalizeBlogSlug(requestedSlug || title || '')
        }

        const labels = normalizeLabels(data.labels ?? originalDoc?.labels)
        data.labels = labels

        const body = data.body ?? originalDoc?.body
        const plainBody = lexicalToPlainText(body)
        const incomingExcerpt =
          typeof data.excerpt === 'string' ? data.excerpt.trim() : originalDoc?.excerpt || ''
        const previousGeneratedExcerpt = createExcerpt(lexicalToPlainText(originalDoc?.body))
        const excerptIsManual = Boolean(
          incomingExcerpt && incomingExcerpt !== previousGeneratedExcerpt,
        )
        const excerpt = excerptIsManual ? incomingExcerpt : createExcerpt(plainBody)
        data.excerpt = excerpt
        data.readingMinutes = calculateReadingMinutes(plainBody)
        data.searchText = [title, excerpt, ...labels.map((label) => label.name), plainBody]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
          .toLowerCase()

        const status = data._status ?? originalDoc?._status
        if (status === 'published' && !data.publishedAt && !originalDoc?.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }

        return data
      },
    ],
    afterChange: [
      ({ context, doc, previousDoc }) => {
        if (context.disableRevalidate) return doc

        const slugs: string[] = []
        if (doc._status === 'published') slugs.push(doc.slug)
        if (
          previousDoc?._status === 'published' &&
          (doc._status !== 'published' || previousDoc.slug !== doc.slug)
        ) {
          slugs.push(previousDoc.slug)
        }
        if (slugs.length) invalidateBlogRoutes(slugs)

        return doc
      },
    ],
    afterDelete: [
      ({ context, doc }) => {
        if (context.disableRevalidate || doc._status !== 'published') return doc
        invalidateBlogRoutes([doc.slug])
        return doc
      },
    ],
  },
}
