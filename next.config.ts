import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)
const r2PublicURL = process.env.R2_PUBLIC_URL

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || '.next',
  experimental: { globalNotFound: true },
  output: 'standalone',
  outputFileTracingExcludes: {
    // Keep build artifacts out of the Payload-backed proxy trace. Next renames the
    // proxy manifest before it copies the runtime files into the standalone output.
    'next-server': ['**/cache/webpack/**', '**/server/proxy.js.nft.json'],
  },
  outputFileTracingIncludes: {
    '/*': [
      './node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf',
      './node_modules/geist/dist/fonts/geist-mono/GeistMono-SemiBold.ttf',
    ],
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns: r2PublicURL
      ? [
          {
            hostname: new URL(r2PublicURL).hostname,
            pathname: '/**',
            protocol: new URL(r2PublicURL).protocol.replace(':', '') as 'http' | 'https',
          },
        ]
      : [],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
