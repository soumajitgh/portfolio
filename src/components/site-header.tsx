'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MobileNavigation } from '@/components/mobile-navigation'
import { isPortfolioRouteActive, portfolioNavigation } from '@/lib/portfolio-navigation'

export function SiteHeader() {
  const pathname = usePathname()
  const home = pathname === '/'
  const creative = pathname.startsWith('/creative')
  return (
    <header
      className={home ? 'split-header portfolio-header-home' : 'portfolio-header'}
      data-identity={creative ? 'creative' : 'technical'}
    >
      <nav aria-label="Primary navigation" className="split-navigation">
        <Link className="split-brand" href="/" aria-label="Soumajit Ghosh — home">
          SG<span aria-hidden="true">.</span>
        </Link>
        <div className="portfolio-nav-links">
          {portfolioNavigation.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isPortfolioRouteActive(pathname, link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <MobileNavigation plain />
      </nav>
    </header>
  )
}
