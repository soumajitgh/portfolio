'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export function ResumePreview({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative h-[75dvh] min-h-[480px] overflow-hidden rounded-lg border border-border bg-card/50">
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground sm:text-sm">
          <Loader2 aria-hidden="true" className="size-4 animate-spin text-terminal-green" />
          loading resume…
        </div>
      ) : null}
      <iframe
        className="size-full"
        onLoad={() => setLoaded(true)}
        src={url}
        title="Resume preview"
      />
    </div>
  )
}
