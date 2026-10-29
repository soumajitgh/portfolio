import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCreativeCollections } from '@/lib/creative-data'
import { creativeCollectionRecords } from '@/lib/creative-content'
import { PhotoSequence } from '@/components/portfolio/photo-sequence'
import { PortfolioEntrance } from '@/components/portfolio/entrance'

export const revalidate = 300
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const collection = creativeCollectionRecords.find((item) => item.slug === slug)
  return {
    title: collection?.title || 'Collection not found',
    alternates: { canonical: `/creative/${slug}` },
  }
}
export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!creativeCollectionRecords.some((item) => item.slug === slug)) notFound()
  const collections = await getCreativeCollections().catch(() => null)
  if (collections === null)
    return (
      <main className="portfolio-area" data-identity="creative">
        <div className="portfolio-container portfolio-intro">
          <Link href="/creative">← Creative</Link>
          <h1>Collection unavailable</h1>
          <p>Please try again shortly.</p>
        </div>
      </main>
    )
  const collection = collections.find((item) => item.slug === slug)
  if (!collection) notFound()
  return (
    <main className="portfolio-area" data-identity="creative">
      <div className="portfolio-container">
        <nav className="portfolio-breadcrumb" aria-label="Breadcrumb">
          <Link href="/creative">Creative</Link>
          <span>/</span>
          <span>{collection.title}</span>
        </nav>
        <PortfolioEntrance>
          <header className="portfolio-intro" data-portfolio-intro>
            <p className="portfolio-eyebrow">
              Photographs / {String(collection.images.length).padStart(2, '0')}
            </p>
            <h1>{collection.title}</h1>
            {collection.description ? <p>{collection.description}</p> : null}
          </header>
        </PortfolioEntrance>
        <PhotoSequence images={collection.images} title={collection.title} />
        <footer className="portfolio-footer">
          <Link href="/creative">← All collections</Link>
          <Link href="/technical">Explore Technical ↗</Link>
        </footer>
      </div>
    </main>
  )
}
