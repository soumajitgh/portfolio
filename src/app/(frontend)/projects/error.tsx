'use client'

import { Button } from '@/components/ui/button'

export default function ProjectsError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[calc(100dvh-4rem)] place-items-center px-4 sm:px-6">
      <div className="rounded-lg border border-destructive/40 bg-card p-6 font-mono">
        <p className="text-terminal-red">error: unable to load project index</p>
        <Button className="mt-4" onClick={reset} variant="outline">
          ./reload
        </Button>
      </div>
    </main>
  )
}
