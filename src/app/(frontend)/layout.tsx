import React from 'react'
import type { Metadata } from 'next'
import { DM_Sans, Outfit } from 'next/font/google'

import { AppShell } from '@/components/app-shell'
import {
  getSiteURL,
  indexableRobots,
  siteDescription,
  siteKeywords,
  siteName,
  siteTitle,
} from '@/lib/seo'

import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

// Payload-backed pages need the runtime PostgreSQL connection. Keeping this
// segment dynamic prevents Docker builds from querying the production database.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteURL()),
  applicationName: 'soumajit.dev',
  authors: [{ name: siteName, url: '/' }],
  category: 'technology',
  creator: siteName,
  description: siteDescription,
  keywords: siteKeywords,
  openGraph: {
    description: siteDescription,
    locale: 'en_IN',
    siteName: 'soumajit.dev',
    title: siteTitle,
    type: 'website',
    url: '/',
  },
  publisher: siteName,
  referrer: 'origin-when-cross-origin',
  robots: indexableRobots,
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  twitter: {
    card: 'summary_large_image',
    description: siteDescription,
    title: siteTitle,
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html className={`${outfit.variable} ${dmSans.variable}`} lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
