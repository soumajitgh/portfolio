'use client'

import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

const links = [
  { href: '/blog', label: './blog' },
  { href: '/projects', label: './projects' },
  { href: '/contact', label: './contact' },
  { href: '/admin', label: './admin' },
]

export function MobileNavigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const previousPathRef = useRef(pathname)

  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname
      setOpen(false)
    }
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    firstLinkRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function close() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="md:hidden">
      <Button
        aria-controls="mobile-navigation"
        aria-expanded={open}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        className="size-11"
        onClick={() => setOpen((value) => !value)}
        ref={triggerRef}
        size="icon"
        variant="ghost"
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>

      {open ? (
        <div
          className="absolute inset-x-0 top-full border-b border-border bg-background/98 px-[max(1rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-lg backdrop-blur"
          id="mobile-navigation"
        >
          <div className="mx-auto grid max-w-6xl gap-1">
            {links.map((link, index) => (
              <Link
                aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
                className="flex min-h-11 items-center rounded-md px-3 font-mono text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-accent aria-[current=page]:text-terminal-cyan"
                href={link.href}
                key={link.href}
                onClick={close}
                ref={index === 0 ? firstLinkRef : undefined}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
