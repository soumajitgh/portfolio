import Image from 'next/image'

import { cn } from '@/lib/utils'
import type { Media } from '@/payload-types'

export function ProjectMedia({
  caption,
  className,
  media,
  priority = false,
}: {
  caption?: null | string
  className?: string
  media: Media
  priority?: boolean
}) {
  if (!media.url) return null

  return (
    <figure className={cn('mx-auto mt-8 max-w-5xl sm:mt-10', className)}>
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
        <Image
          alt={media.alt}
          className="object-contain"
          fill
          priority={priority}
          sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 960px"
          src={media.url}
        />
      </div>
      {caption || media.caption ? (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption || media.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
