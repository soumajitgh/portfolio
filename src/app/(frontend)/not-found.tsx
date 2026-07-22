import type { Metadata } from 'next'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  description: 'error: the requested path does not exist.',
  title: 'soumajit in ~/404',
}

export default function NotFound() {
  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center px-4 sm:px-6">
      <div className="max-w-lg rounded-lg border border-border bg-card p-8 font-mono">
        <p className="text-terminal-red">404: path not found</p>
        <h1 className="mt-3 text-xl font-semibold sm:text-2xl">
          The requested project does not exist.
        </h1>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/projects">cd ~/projects</Link>
        </Button>
      </div>
    </main>
  )
}
