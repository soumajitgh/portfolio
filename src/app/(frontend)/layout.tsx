import React from 'react'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'

import { AppShell } from '@/components/app-shell'

import './globals.css'

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const description = 'output: backend systems, APIs, and infrastructure.'

// Payload-backed pages need the runtime PostgreSQL connection. Keeping this
// segment dynamic prevents Docker builds from querying the production database.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  applicationName: 'soumajit.dev',
  description,
  openGraph: {
    description,
    siteName: 'soumajit.dev',
    title: 'soumajit ghosh',
    type: 'website',
  },
  title: 'soumajit ghosh',
  twitter: {
    card: 'summary_large_image',
    description,
    title: 'soumajit ghosh',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html className="dark" lang="en">
      <body className={GeistSans.variable}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
