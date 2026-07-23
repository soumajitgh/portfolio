import { Terminal } from 'lucide-react'
import Link from 'next/link'

import { MobileNavigation } from '@/components/mobile-navigation'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-border/60 bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <nav
        aria-label="Primary navigation"
        className="page-container flex h-16 items-center justify-between"
      >
        <Link className="flex min-h-11 items-center gap-2 text-sm text-foreground" href="/">
          <Terminal className="size-4 text-terminal-cyan" aria-hidden="true" />
          <span>
            soumajit<span className="hidden sm:inline">.dev</span>
          </span>
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild className="px-2 sm:px-3" size="sm" variant="ghost">
            <Link href="/blogs">./blogs</Link>
          </Button>
          <Button asChild className="px-2 sm:px-3" size="sm" variant="ghost">
            <Link href="/projects">./projects</Link>
          </Button>
          <Button asChild className="px-2 sm:px-3" size="sm" variant="ghost">
            <Link href="/stats">./stats</Link>
          </Button>
          <Button asChild className="px-2 sm:px-3" size="sm" variant="ghost">
            <Link href="/contact">./contact</Link>
          </Button>
        </div>
        <MobileNavigation />
      </nav>
    </header>
  )
}
