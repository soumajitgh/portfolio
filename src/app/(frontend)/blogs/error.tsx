'use client'

import { Button } from '@/components/ui/button'

export default function BlogError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <main className="page-container py-12 md:py-16">
        <div className="rounded-lg border border-destructive/40 bg-card p-8 font-mono text-sm">
          <h1 className="text-lg font-semibold text-terminal-red">
            error: unable to load blog index
          </h1>
          <p className="mt-3 text-muted-foreground">
            The content service did not return a usable response.
          </p>
          <Button className="mt-6" onClick={reset} variant="outline">
            ./reload
          </Button>
        </div>
      </main>
    </div>
  )
}
