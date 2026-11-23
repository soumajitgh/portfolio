import type { Metadata } from 'next'
import { ArrowLeft, Camera } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { findPhotographyCollection, photographyCollections } from '@/lib/photography'
import { nonIndexableRobots } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return photographyCollections.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const collection = findPhotographyCollection(slug)
  if (!collection) return { title: 'Collection not found', robots: nonIndexableRobots }

  return {
    alternates: { canonical: `/photography/collections/${slug}` },
    description: collection.description,
    robots: nonIndexableRobots,
    title: collection.title,
  }
}

export default async function PhotographyCollectionPage({ params }: Props) {
  const { slug } = await params
  const collection = findPhotographyCollection(slug)
  if (!collection) notFound()

  return (
    <main className="page-container py-12 sm:py-16 lg:py-24">
      <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/photography/collections">
        <ArrowLeft aria-hidden="true" className="size-4" /> All collections
      </Link>
      <header className="mt-12 max-w-3xl">
        <p className="text-xs text-muted-foreground">PHOTOGRAPHY / COLLECTION</p>
        <h1 className="mt-4 text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-tight tracking-[-0.05em]">
          {collection.title}
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">{collection.description}</p>
      </header>
      <section aria-label="Collection photographs" className="mt-14 flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 text-center">
        <Camera aria-hidden="true" className="size-7 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-medium">Collection in progress</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          No photographs have been published in this collection yet. The page is available to review the route and layout.
        </p>
      </section>
    </main>
  )
}
