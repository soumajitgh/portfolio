import type { Metadata } from 'next'

import { HomeHero } from '@/components/home-hero'
import { PortfolioShowcase } from '@/components/landing-experience'
import { PageContainer } from '@/components/page-container'
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
      <main className="grid min-h-[calc(100dvh-4rem)] place-items-center px-4 sm:px-6">
        <div className="max-w-lg rounded-lg border border-destructive/40 bg-card p-6 font-mono">
          <p className="text-terminal-red">error: unable to load portfolio index</p>
          <p className="mt-2 text-sm text-muted-foreground">Retry with ./reload in a moment.</p>
        </div>
      </main>
    )
  }

  return (
    <div className="landing-shell">
      <PageContainer className="landing-main">
        <HomeHero settings={data.settings} />
        <PortfolioShowcase {...data} />
      </PageContainer>
    </div>
  )
}
