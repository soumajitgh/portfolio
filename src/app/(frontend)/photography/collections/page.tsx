import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'

import { photographyCollections } from '@/lib/photography'

export const metadata: Metadata = {
  alternates: { canonical: '/photography/collections' },
  description: 'Browse photography collections by Soumajit Ghosh, including birds, wildlife, nature, and countryside.',
  title: 'Photography Collections',
}

export default function PhotographyCollectionsPage() {
  return (
    <main className="page-container py-12 sm:py-16 lg:py-24">
      <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/photography">
        <ArrowLeft aria-hidden="true" className="size-4" /> Photography
      </Link>
      <header className="mt-10 max-w-3xl">
        <p className="text-xs text-muted-foreground">PHOTOGRAPHY / COLLECTIONS</p>
        <h1 className="mt-3 text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-tight tracking-[-0.05em]">
          Collections.
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Browse by subject. These collections are being prepared for their first published photographs.
        </p>
      </header>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {photographyCollections.map((collection, index) => (
          <Link
            className="group flex min-h-72 flex-col justify-between rounded-xl border border-border bg-card/40 p-7 hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={`/photography/collections/${collection.slug}`}
            key={collection.slug}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{String(index + 1).padStart(2, '0')} / COLLECTION</span>
              <ArrowUpRight aria-hidden="true" className="size-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">{collection.title}</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">{collection.description}</p>
              <p className="mt-4 text-xs text-muted-foreground">Awaiting first photographs</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
