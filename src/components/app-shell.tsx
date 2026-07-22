import type { ReactNode } from 'react'

import { SiteHeader } from '@/components/site-header'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <SiteHeader />
      <div className="min-h-[calc(100dvh-4rem)] outline-none" id="main-content" tabIndex={-1}>
        {children}
      </div>
    </>
  )
}
