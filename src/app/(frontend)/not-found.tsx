import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-lg rounded-lg border border-border bg-card p-8 font-mono">
        <p className="text-terminal-red">404: path not found</p>
        <h1 className="mt-3 text-2xl font-semibold">The requested project does not exist.</h1>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/projects">cd ~/projects</Link>
        </Button>
      </div>
    </main>
  )
}
