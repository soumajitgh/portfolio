import React from 'react'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(siteURL),
  description: 'Backend systems, APIs, and developer infrastructure.',
  openGraph: {
    description: 'Backend systems, APIs, and developer infrastructure.',
    siteName: 'Soumajit',
    title: 'Soumajit — Backend Engineer',
    type: 'website',
  },
  title: 'Soumajit — Backend Engineer',
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
