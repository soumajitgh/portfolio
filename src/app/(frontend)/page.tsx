import type { Metadata } from 'next'

import { LandingExperience } from '@/components/landing-experience'
import { getPortfolioHome } from '@/lib/portfolio-data'

export const revalidate = 300

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

async function loadHomeData() {
  try {
    return await getPortfolioHome()
  } catch {
    return null
  }
}

export default async function HomePage() {
  const data = await loadHomeData()

  if (!data) {
    return (
      <main className="grid min-h-dvh place-items-center px-6">
        <div className="max-w-lg rounded-lg border border-destructive/40 bg-card p-6 font-mono">
          <p className="text-terminal-red">error: unable to load portfolio index</p>
          <p className="mt-2 text-sm text-muted-foreground">Retry with ./reload in a moment.</p>
        </div>
      </main>
    )
  }

  return <LandingExperience {...data} />
}
