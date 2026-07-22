import React from 'react'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './globals.css'

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const description = 'output: backend systems, APIs, and infrastructure.'

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
        <main>{children}</main>
      </body>
    </html>
  )
}
