import Link from 'next/link'

export default function CollectionNotFound() {
  return (
    <main className="portfolio-area" data-identity="creative">
      <div className="portfolio-container portfolio-intro">
        <p className="portfolio-eyebrow">404 / Creative</p>
        <h1>Collection not found.</h1>
        <p>This collection is not published or is no longer available.</p>
        <Link className="portfolio-text-link" href="/creative">
          ← Back to Creative
        </Link>
      </div>
    </main>
  )
}
