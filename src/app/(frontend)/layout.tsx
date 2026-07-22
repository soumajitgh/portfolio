import React from 'react'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './globals.css'

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  applicationName: 'soumajit.dev',
  description: 'output: backend systems, APIs, and infrastructure.',
  openGraph: {
    description: 'output: backend systems, APIs, and infrastructure.',
    siteName: 'soumajit.dev',
    title: 'soumajit ghosh',
    type: 'website',
  },
  title: 'soumajit ghosh',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html className="dark" lang="en">
      <body className={GeistSans.variable}>
        <main>{children}</main>
      </body>
    </html>
  )
}
