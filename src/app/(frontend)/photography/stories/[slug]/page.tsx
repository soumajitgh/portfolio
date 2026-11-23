import type { Metadata } from 'next'
import { ArrowLeft, Images } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { storyLayoutPreviewSlug } from '@/lib/photography'
import { nonIndexableRobots } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return [{ slug: storyLayoutPreviewSlug }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (slug !== storyLayoutPreviewSlug) return { title: 'Story not found', robots: nonIndexableRobots }

  return {
    description: 'Unpublished layout preview for a photography story.',
    robots: nonIndexableRobots,
    title: 'Photo Story Layout Preview',
  }
}

export default async function PhotoStoryPage({ params }: Props) {
  const { slug } = await params
  if (slug !== storyLayoutPreviewSlug) notFound()

  return (
    <main className="page-container py-12 sm:py-16 lg:py-24">
      <Link className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" href="/photography/stories">
        <ArrowLeft aria-hidden="true" className="size-4" /> All photo stories
      </Link>
      <header className="mx-auto mt-12 max-w-3xl text-center">
        <p className="text-xs font-medium text-muted-foreground">LAYOUT PREVIEW / NOT PUBLISHED</p>
        <h1 className="mt-4 text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-tight tracking-[-0.05em]">
          A story, told in frames.
        </h1>
        <p className="mt-5 text-base leading-7 text-muted-foreground">
          This page demonstrates the future photo-story format: introduction, lead photograph,
          sequenced images, and an optional closing note.
        </p>
      </header>

      <section aria-label="Story layout placeholders" className="mx-auto mt-14 max-w-5xl">
        <div className="grid aspect-[16/9] place-items-center rounded-xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-3"><Images aria-hidden="true" className="size-7" /><span>Lead photograph</span></div>
        </div>
        <p className="mx-auto my-12 max-w-2xl text-center text-base leading-8 text-muted-foreground">
          A short introduction will explain the subject and intention of the photo story.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          <div className="grid aspect-[3/4] place-items-center rounded-xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">Photograph 02</div>
          <div className="grid aspect-[3/4] place-items-center rounded-xl border border-dashed border-border bg-card/40 text-sm text-muted-foreground">Photograph 03</div>
        </div>
        <p className="mt-12 text-center text-xs text-muted-foreground">
          Preview only. Real stories will appear here after photographs and narratives are published.
        </p>
      </section>
    </main>
  )
}
