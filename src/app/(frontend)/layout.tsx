import React from 'react'
import { GeistSans } from 'geist/font/sans'
import './globals.css'

export const metadata = {
  description: 'Backend systems, APIs, and developer infrastructure.',
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
