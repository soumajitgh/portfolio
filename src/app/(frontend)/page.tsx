import type { Metadata } from 'next'
import { Suspense } from 'react'

import { HomeHero } from '@/components/home-hero'
import { HomeStatsFallback, HomeStatsWidget } from '@/components/home-stats-widget'
import { PortfolioShowcase } from '@/components/landing-experience'
import { PageContainer } from '@/components/page-container'
import { getPortfolioHome } from '@/lib/portfolio-data'
import {
  absoluteURL,
  serializeJsonLd,
  siteDescription,
  siteExpertise,
  siteName,
  siteProfiles,
  siteRole,
  siteTitle,
} from '@/lib/seo'

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

  const socialProfiles = Array.from(
    new Set([
      ...siteProfiles,
      ...(data.settings.contact?.socials?.map((social) => social.url) || []),
    ]),
  )
  const skills =
    data.settings.skills?.flatMap((group) => group.items?.map((item) => item.name) || []) || []
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${absoluteURL('/')}#person`,
        '@type': 'Person',
        affiliation: [
          {
            '@type': 'CollegeOrUniversity',
            name: 'Kalinga Institute of Industrial Technology',
          },
          {
            '@type': 'Organization',
            name: 'Google Developer Group KIIT',
          },
        ],
        description: siteDescription,
        jobTitle: siteRole,
        knowsAbout: Array.from(
          new Set([...siteExpertise, ...skills, ...data.stack.map((topic) => topic.name)]),
        ),
        name: siteName,
        sameAs: socialProfiles,
        subjectOf: {
          '@type': 'CreativeWork',
          name: `${siteName} Resume`,
          url: absoluteURL('/resume'),
        },
        url: absoluteURL('/'),
      },
      {
        '@id': `${absoluteURL('/')}#profile`,
        '@type': 'ProfilePage',
        dateCreated: data.settings.createdAt,
        dateModified: data.settings.updatedAt,
        mainEntity: { '@id': `${absoluteURL('/')}#person` },
        name: siteTitle,
        url: absoluteURL('/'),
      },
      {
        '@id': `${absoluteURL('/')}#website`,
        '@type': 'WebSite',
        description: siteDescription,
        inLanguage: 'en',
        name: 'soumajit.dev',
        publisher: { '@id': `${absoluteURL('/')}#person` },
        url: absoluteURL('/'),
      },
    ],
  }

  return (
    <div className="landing-shell">
      <PageContainer className="landing-main">
        <HomeHero settings={data.settings} />
        <PortfolioShowcase
          {...data}
          statsPanel={
            <Suspense fallback={<HomeStatsFallback />}>
              <HomeStatsWidget />
            </Suspense>
          }
        />
        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
          type="application/ld+json"
        />
      </PageContainer>
    </div>
  )
}
