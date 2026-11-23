import Link from 'next/link'

import { MobileNavigation } from '@/components/mobile-navigation'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-border bg-background pt-[env(safe-area-inset-top)]">
      <nav
        aria-label="Primary navigation"
        className="page-container flex h-16 items-center justify-between font-sans"
      >
        <Link
          className="flex min-h-11 items-center rounded-sm text-base font-semibold text-foreground transition-colors hover:text-primary"
          href="/"
        >
          soumajit.dev
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild className="px-3 text-sm" size="sm" variant="ghost">
            <Link href="/work">Work</Link>
          </Button>
          <Button asChild className="px-3 text-sm" size="sm" variant="ghost">
            <Link href="/photography">Photography</Link>
          </Button>
          <Button asChild className="px-3 text-sm" size="sm" variant="ghost">
            <Link href="/stats">Stats</Link>
          </Button>
          <Button asChild className="px-3 text-sm" size="sm" variant="ghost">
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
        <MobileNavigation />
      </nav>
    </header>
  )
}
