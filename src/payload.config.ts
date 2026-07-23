import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { BlocksFeature, CodeBlock, lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { BlogPosts } from './collections/BlogPosts'
import { BlogStars } from './collections/BlogStars'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { ProjectStars } from './collections/ProjectStars'
import { PortfolioSettings } from './globals/PortfolioSettings'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const r2PublicURL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
const r2Enabled = Boolean(
  process.env.R2_BUCKET &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_ENDPOINT &&
  r2PublicURL,
)

export default buildConfig({
  admin: {
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' | soumajit in ~/admin',
    },
    user: Users.slug,
  },
  collections: [Users, Media, Projects, BlogPosts, ProjectStars, BlogStars],
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || '',
    defaultFromAddress: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev',
    defaultFromName: process.env.EMAIL_FROM_NAME || 'soumajit.dev',
  }),
  globals: [PortfolioSettings],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      BlocksFeature({ blocks: [CodeBlock()] }),
    ],
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Migrations include database-level constraints and the atomic blog counter,
    // so automatic development pushes must not compete with them at startup.
    prodMigrations: migrations,
    push: false,
  }),
  sharp,
  plugins: [
    mcpPlugin({
      collections: {
        'blog-posts': {
          description: 'Published portfolio blog posts and their display metadata.',
          enabled: {
            find: true,
            create: false,
            update: false,
            delete: false,
          },
        },
        projects: {
          description: 'Published portfolio projects, technologies, media, and external links.',
          enabled: {
            find: true,
            create: false,
            update: false,
            delete: false,
          },
        },
      },
      globals: {
        'portfolio-settings': {
          description: 'Portfolio hero, contact, social, and home-page display settings.',
          enabled: {
            find: true,
            update: false,
          },
        },
      },
    }),
    s3Storage({
      alwaysInsertFields: true,
      bucket: process.env.R2_BUCKET || '',
      collections: {
        media: {
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            const key = prefix ? `${prefix}/${filename}` : filename
            return `${r2PublicURL}/${key}`
          },
          prefix: 'media',
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        endpoint: process.env.R2_ENDPOINT,
        forcePathStyle: true,
        region: 'auto',
      },
      enabled: r2Enabled,
    }),
  ],
})
