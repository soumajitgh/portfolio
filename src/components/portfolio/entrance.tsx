'use client'

import { useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function PortfolioEntrance({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-portfolio-intro]', {
          y: 12,
          duration: 0.5,
          ease: 'power2.out',
          clearProps: 'transform',
        })
      })
      return () => media.revert()
    },
    { scope: root },
  )
  return <div ref={root}>{children}</div>
}
