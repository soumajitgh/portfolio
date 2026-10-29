'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { BrainArtwork } from '@/components/brain-artwork'
import { heroPhoto } from '@/lib/hero-artwork'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function HomeHero() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      // Content is visible in CSS and server-rendered HTML. Only enhance it when
      // motion is welcome; matchMedia also reverts if the preference changes.
      const styles = getComputedStyle(root.current!)
      const preciseDuration = parseFloat(styles.getPropertyValue('--motion-precise'))
      const softDuration = parseFloat(styles.getPropertyValue('--motion-soft'))
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline()
          .from('[data-hero-name]', { y: 10, opacity: 0, duration: 0.4, ease: 'power2.out' })
          .from(
            '[data-technical-reveal]',
            {
              y: 18,
              opacity: 0,
              duration: preciseDuration,
              stagger: 0.09,
              ease: 'power2.out',
            },
            0.12,
          )
          .from(
            '[data-creative-reveal]',
            {
              y: 22,
              opacity: 0,
              duration: softDuration,
              stagger: 0.1,
              ease: 'sine.out',
            },
            0.16,
          )
      })
      return () => media.revert()
    },
    { scope: root },
  )

  return (
    <section aria-label="Technical and Creative portfolio" className="split-hero" ref={root}>
      <div
        className="hero-background hero-background-technical"
        data-hero-background="technical"
        aria-hidden="true"
      />
      <div
        className="hero-background hero-background-creative"
        data-hero-background="creative"
        aria-hidden="true"
      />
      <div className="hero-art-layout">
        <div className="hero-art-motion" data-hero-artwork>
          <BrainArtwork />
        </div>
      </div>
      <div className="identity-panel identity-technical" data-identity="technical">
        <div className="identity-masthead">
          <h1 className="identity-name" data-hero-name>
            Soumajit Ghosh
          </h1>
          <span aria-hidden="true" className="identity-index">
            01
          </span>
        </div>
        <div className="identity-copy">
          <h2 data-technical-reveal>
            <Link href="/technical">Technical</Link>
          </h2>
          <p data-technical-reveal>Systems. Software. Engineering.</p>
        </div>
        <nav aria-label="Technical work" className="identity-footer">
          <Link className="identity-link" href="/projects">
            Projects <ArrowUpRight aria-hidden="true" />
          </Link>
          <Link className="identity-link" href="/work">
            Experience <ArrowUpRight aria-hidden="true" />
          </Link>
        </nav>
      </div>
      <div className="identity-panel identity-creative" data-identity="creative">
        <div className="identity-masthead identity-masthead-creative">
          <span className="identity-note">One person. Two perspectives.</span>
          <span aria-hidden="true" className="identity-index">
            02
          </span>
        </div>
        <div className="identity-copy">
          <h2 data-creative-reveal>
            <Link href="/creative">Creative</Link>
          </h2>
          <p data-creative-reveal>Images. Stories. Exploration.</p>
        </div>
        <div aria-label="Creative disciplines" className="identity-footer">
          <span className="identity-discipline">Photography</span>
          <span className="identity-discipline">Visual stories</span>
        </div>
      </div>
      <p className="hero-photo-credit">
        Development photo · <a href={heroPhoto.source}>{heroPhoto.credit}</a>
      </p>
      <a aria-label="Explore portfolio overview" className="hero-scroll" href="#portfolio">
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
  )
}
