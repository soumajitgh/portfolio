import { ArrowUpRight, Download } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import type { PortfolioHomeData } from '@/lib/portfolio-data'

function PrimaryAction() {
  return (
    <Button
      asChild
      className="h-auto min-h-11 w-full max-w-full whitespace-normal py-2 sm:w-auto md:min-h-9"
      variant="default"
    >
      <Link href="/work">
        ./view-work <ArrowUpRight aria-hidden="true" />
      </Link>
    </Button>
  )
}

export function HomeHero({ settings }: Pick<PortfolioHomeData, 'settings'>) {
  return (
    <section className="flex min-h-0 w-full max-w-full items-center overflow-x-clip py-4 sm:py-[clamp(1.5rem,4dvh,3rem)]">
      <div className="min-w-0 max-w-full sm:max-w-4xl">
        <p className="mb-2 max-w-full break-words font-mono text-xs text-terminal-green [overflow-wrap:anywhere] sm:mb-[clamp(.75rem,2dvh,1.25rem)] sm:text-sm">
          {settings.heroCommand}
        </p>
        <h1 className="max-w-full whitespace-normal font-mono text-[clamp(1.9rem,8.5vw,2.75rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-balance [overflow-wrap:anywhere] sm:max-w-4xl sm:whitespace-pre-line sm:text-[clamp(3rem,6.5dvh,4rem)] sm:leading-[1.03]">
          {settings.heroHeadline}
        </h1>
        <p className="mt-3 max-w-full break-words text-[0.8125rem] leading-6 text-muted-foreground [overflow-wrap:anywhere] sm:mt-[clamp(.75rem,2.2dvh,1.5rem)] sm:max-w-2xl sm:text-base sm:leading-7 lg:text-lg">
          {settings.heroDescription}
        </p>
        <div className="mt-4 flex w-full min-w-0 max-w-full flex-col gap-2 sm:mt-[clamp(1rem,2.5dvh,2rem)] sm:flex-row sm:flex-wrap sm:gap-3">
          <PrimaryAction />
          <Button asChild className="w-full max-w-full sm:w-auto" variant="outline">
            <a href="/resume">
              ./resume <Download aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
