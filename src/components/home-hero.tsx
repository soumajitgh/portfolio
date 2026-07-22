import { ArrowUpRight, Download } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import type { PortfolioHomeData } from '@/lib/portfolio-data'

function HeroAction({
  action,
  primary = false,
}: {
  action: { label: string; url: string }
  primary?: boolean
}) {
  const external = action.url.startsWith('http')

  return (
    <Button
      asChild
      className="h-auto min-h-11 w-full whitespace-normal py-2 sm:w-auto md:min-h-9"
      variant={primary ? 'default' : 'outline'}
    >
      <Link
        href={action.url}
        rel={external ? 'noopener noreferrer' : undefined}
        target={external ? '_blank' : undefined}
      >
        {action.label} {primary ? <ArrowUpRight aria-hidden="true" /> : null}
      </Link>
    </Button>
  )
}

export function HomeHero({ settings }: Pick<PortfolioHomeData, 'settings'>) {
  return (
    <section className="flex min-h-0 flex-col justify-center py-[clamp(1.25rem,3dvh,2rem)] sm:py-[clamp(1.5rem,4dvh,3rem)]">
      <p className="mb-[clamp(.75rem,2dvh,1.25rem)] break-words font-mono text-xs text-terminal-green sm:text-sm">
        {settings.heroCommand}
      </p>
      <h1 className="max-w-4xl whitespace-normal font-mono text-[clamp(2.125rem,9vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.04em] [overflow-wrap:anywhere] sm:whitespace-pre-line sm:text-[clamp(3rem,6.5dvh,4rem)] sm:leading-[1.03] sm:text-balance">
        {settings.heroHeadline}
      </h1>
      <p className="mt-[clamp(.75rem,2.2dvh,1.5rem)] max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:text-lg">
        {settings.heroDescription}
      </p>
      <div className="mt-[clamp(1rem,2.5dvh,2rem)] flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <HeroAction action={settings.primaryAction} primary />
        <Button asChild className="w-full sm:w-auto" variant="outline">
          <a href="/resume">
            ./resume <Download aria-hidden="true" />
          </a>
        </Button>
      </div>
    </section>
  )
}
