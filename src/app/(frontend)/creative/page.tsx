import type { Metadata } from 'next'
import Link from 'next/link'
import { CreativeIndex } from '@/components/portfolio/creative-index'
import { PortfolioEntrance } from '@/components/portfolio/entrance'
import { getCreativeCollections } from '@/lib/creative-data'

export const revalidate = 300
export const metadata: Metadata = {
  title: 'Creative',
  description: 'Photographs, collections, and visual stories by Soumajit Ghosh.',
  alternates: { canonical: '/creative' },
}

export default async function CreativePage() {
  const collections = await getCreativeCollections().catch(() => null)
  return (
    <main className="portfolio-area creative-area" data-identity="creative">
      <div className="portfolio-container">
        <PortfolioEntrance>
          <header className="portfolio-intro" data-portfolio-intro>
            <p className="portfolio-eyebrow">Soumajit Ghosh / Creative</p>
            <h1>
              Images. Stories.
              <br />
              <span>Exploration.</span>
            </h1>
            <div className="portfolio-intro-bottom">
              <p>Photographs and visual stories.</p>
              <span className="portfolio-eyebrow">A different perspective</span>
            </div>
          </header>
        </PortfolioEntrance>
        {collections?.length ? (
          <CreativeIndex collections={collections} />
        ) : (
          <section className="creative-empty" aria-labelledby="collections-heading">
            <span className="creative-empty-mark" aria-hidden="true">
              ✳
            </span>
            <div>
              <h2 id="collections-heading">A space for photographs.</h2>
              <p>
                {collections === null
                  ? 'The collections are temporarily unavailable. Please try again shortly.'
                  : 'Personal photographs and collections have not been published here yet.'}
              </p>
            </div>
          </section>
        )}
        <footer className="portfolio-footer">
          <Link href="/technical">Explore Technical ↗</Link>
          <Link href="/contact">Get in touch ↗</Link>
          <Link href="/">Home</Link>
        </footer>
      </div>
    </main>
  )
}
