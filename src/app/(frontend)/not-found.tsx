import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  description: 'The requested page could not be found.',
  robots: { follow: false, index: false },
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center px-4 sm:px-6">
      <div className="max-w-lg rounded-lg border border-border bg-card p-8 font-mono">
        <p className="text-terminal-red">HTTP 404</p>
        <h1 className="mt-3 text-xl font-semibold sm:text-2xl">Page not found</h1>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/">Return to home</Link>
        </Button>
      </div>
    </main>
  )
}
