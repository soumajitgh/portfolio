import type { Metadata } from 'next'
import { ArrowUpRight, Camera, Images } from 'lucide-react'
import Link from 'next/link'

import { photographyCollections } from '@/lib/photography'

export const metadata: Metadata = {
  alternates: { canonical: '/photography' },
  description: 'Explore the photography portfolio of Soumajit Ghosh, featuring wildlife, nature, and countryside photographs.',
  title: 'Photography',
}

export default function PhotographyPage() {
  return (
    <main className="page-container py-12 sm:py-16 lg:py-24">
      <header className="max-w-4xl">
        <p className="text-sm font-medium tracking-wide text-muted-foreground">SOUMAJIT GHOSH / PHOTOGRAPHY</p>
        <h1 className="mt-5 text-[clamp(3rem,9vw,6rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
          Through my lens.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
          Wildlife, nature, and moments from everyday life. A home for the photographs and stories I choose to share.
        </p>
      </header>

      <section aria-labelledby="selected-photographs" className="mt-16 border-t border-border pt-8 sm:mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">01 / PORTFOLIO</p>
            <h2 id="selected-photographs" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Selected photographs
            </h2>
          </div>
          <Camera aria-hidden="true" className="size-6 text-muted-foreground" />
        </div>
        <div className="mt-7 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
          <Images aria-hidden="true" className="size-7 text-muted-foreground" />
          <p className="mt-4 font-medium">Photographs coming soon</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            This gallery is ready for a curated selection of original photographs. No sample images have been published.
          </p>
        </div>
      </section>

      <section aria-labelledby="photography-collections" className="mt-16 border-t border-border pt-8 sm:mt-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">02 / EXPLORE</p>
            <h2 id="photography-collections" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Collections
            </h2>
          </div>
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline-offset-4 hover:underline" href="/photography/collections">
            All collections <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {photographyCollections.map((collection, index) => (
            <Link
              className="group flex min-h-60 flex-col justify-between rounded-xl border border-border bg-card/40 p-6 transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-8"
              href={`/photography/collections/${collection.slug}`}
              key={collection.slug}
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{String(index + 1).padStart(2, '0')} / COLLECTION</span>
                <ArrowUpRight aria-hidden="true" className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{collection.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{collection.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="photo-stories" className="mt-16 border-t border-border pt-8 sm:mt-24">
        <p className="text-xs text-muted-foreground">03 / NARRATIVES</p>
        <h2 id="photo-stories" className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Photo stories
        </h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
          Connected series of photographs, organized into a narrative rather than a single gallery.
          The first story is still being prepared.
        </p>
        <Link className="mt-6 inline-flex items-center gap-2 font-medium underline-offset-4 hover:underline" href="/photography/stories">
          Explore photo stories <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
    </main>
  )
}
