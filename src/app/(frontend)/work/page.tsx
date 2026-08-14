import { ArrowUpRight, FolderGit2, GitPullRequest } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { absoluteURL, serializeJsonLd, siteName } from '@/lib/seo'

const pageTitle = 'Work'
const pageDescription =
  'Explore products and systems built by Soumajit Ghosh, along with contributions shipped to open source projects.'

export const metadata: Metadata = {
  alternates: { canonical: '/work' },
  description: pageDescription,
  openGraph: {
    description: pageDescription,
    title: pageTitle,
    type: 'website',
    url: '/work',
  },
  title: pageTitle,
  twitter: {
    card: 'summary_large_image',
    description: pageDescription,
    title: pageTitle,
  },
}

const workAreas = [
  {
    accent: 'text-terminal-blue',
    description:
      'Fullstack products, AI applications, developer tools, and infrastructure built from problem to production.',
    details: ['Products', 'Systems', 'Experiments'],
    glow: 'from-terminal-blue/10',
    href: '/projects',
    icon: FolderGit2,
    index: '01',
    overline: 'Products & systems',
    route: './projects',
    title: 'Projects',
  },
  {
    accent: 'text-terminal-purple',
    description:
      'Pull requests contributed across the ecosystem, focused on impact, implementation quality, and maintainability.',
    details: ['Pull requests', 'Impact', 'Community'],
    glow: 'from-terminal-purple/10',
    href: '/contributions',
    icon: GitPullRequest,
    index: '02',
    overline: 'Open source',
    route: './contributions',
    title: 'OSS Contributions',
  },
] as const

export default function WorkPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    author: { '@type': 'Person', name: siteName, url: absoluteURL('/') },
    description: pageDescription,
    hasPart: workAreas.map((area) => ({
      '@type': 'CollectionPage',
      description: area.description,
      name: area.title,
      url: absoluteURL(area.href),
    })),
    name: pageTitle,
    url: absoluteURL('/work'),
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <main className="page-container py-10 sm:py-14 lg:py-20">
        <header className="grid gap-7 border-b border-border/80 pb-10 md:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)] md:items-end md:gap-16 lg:pb-12">
          <div>
            <p className="font-mono text-xs text-terminal-green sm:text-sm">
              soumajit@portfolio:~$ <span className="text-foreground">ls ./work</span>
            </p>
            <h1 className="mt-5 font-mono text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
              My work
            </h1>
          </div>

          <div className="md:pb-1">
            <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Projects I have built and open-source contributions I have made.
            </p>
            <div className="mt-5 flex items-center gap-3 font-mono text-[0.6875rem] text-muted-foreground sm:text-xs">
              <span className="size-1.5 rounded-full bg-terminal-green" aria-hidden="true" />
              <span>02 active directories</span>
            </div>
          </div>
        </header>

        <nav
          aria-label="Work categories"
          className="grid border-b border-border/80 md:grid-cols-2 md:divide-x md:divide-border/80"
        >
          {workAreas.map((area) => {
            const Icon = area.icon

            return (
              <Link
                className="group relative isolate flex min-h-[22rem] flex-col overflow-hidden border-b border-border/80 px-1 py-8 transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-7 sm:py-10 md:border-b-0 lg:min-h-[25rem] lg:px-10 lg:py-12"
                href={area.href}
                key={area.href}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br ${area.glow} via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100`}
                />
                <div className="flex items-center justify-between gap-4 font-mono text-[0.6875rem] sm:text-xs">
                  <span className="text-terminal-yellow">{area.index} / WORK</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-5 text-muted-foreground transition-[color,transform] group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground"
                  />
                </div>

                <div className="mt-14 sm:mt-16">
                  <div className="flex items-center gap-3">
                    <Icon aria-hidden="true" className={`size-5 ${area.accent}`} />
                    <p className={`font-mono text-xs ${area.accent}`}>{area.overline}</p>
                  </div>
                  <h2 className="mt-4 max-w-[13ch] break-words font-mono text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.05] tracking-[-0.055em] text-foreground">
                    {area.title}
                  </h2>
                  <p className="mt-5 max-w-lg text-sm leading-6 text-muted-foreground sm:text-[0.9375rem] sm:leading-7">
                    {area.description}
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-5 pt-10">
                  <div className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-muted-foreground sm:text-[0.6875rem]">
                    {area.details.map((detail, index) => (
                      <span key={detail}>
                        {index ? <span className="mr-3 text-border">/</span> : null}
                        {detail}
                      </span>
                    ))}
                  </div>
                  <span className={`font-mono text-xs ${area.accent}`}>{area.route}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        <script
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
          type="application/ld+json"
        />
      </main>
    </div>
  )
}
