import type { Metadata } from 'next'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { storyLayoutPreviewSlug } from '@/lib/photography'

export const metadata: Metadata = {
  alternates: { canonical: '/photography/stories' },
  description: 'Photography stories and visual essays by Soumajit Ghosh.',
  title: 'Photo Stories',
}

export default function PhotoStoriesPage() {
  return (
    <main className="page-container py-12 sm:py-16 lg:py-24">
      <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/photography">
        <ArrowLeft aria-hidden="true" className="size-4" /> Photography
      </Link>
      <header className="mt-10 max-w-3xl">
        <p className="text-xs text-muted-foreground">PHOTOGRAPHY / STORIES</p>
        <h1 className="mt-3 text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-tight tracking-[-0.05em]">
          Photo stories.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          A place for connected photo series and visual essays. No stories are published yet.
        </p>
      </header>
      <section className="mt-12 rounded-xl border border-border bg-card/40 p-7 sm:p-10" aria-labelledby="preview-story-heading">
        <p className="text-xs font-medium text-muted-foreground">UNPUBLISHED / LAYOUT PREVIEW</p>
        <h2 id="preview-story-heading" className="mt-3 text-2xl font-semibold tracking-tight">
          Example photo story
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Preview the structure of an individual photo story. It contains no fictional photographs and is excluded from search indexing.
        </p>
        <Link className="mt-6 inline-flex items-center gap-2 font-medium underline-offset-4 hover:underline" href={`/photography/stories/${storyLayoutPreviewSlug}`}>
          Preview story layout <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
    </main>
  )
}
