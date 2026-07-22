import { Terminal } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 shrink-0 border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-10"
      >
        <Link className="flex items-center gap-2 text-sm text-foreground" href="/">
          <Terminal className="size-4 text-terminal-cyan" aria-hidden="true" />
          <span>soumajit.dev</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button asChild size="sm" variant="ghost">
            <Link href="/projects">./projects</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/contact">./contact</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex" size="sm" variant="outline">
            <Link href="/admin">./admin</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
