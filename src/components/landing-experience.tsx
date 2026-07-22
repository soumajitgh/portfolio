'use client'

import { ArrowUpRight, Download, Pin, PinOff } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { HomeBlogPosts } from '@/components/home-blog-posts'
import { ProjectRail } from '@/components/project-rail'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { PortfolioHomeData } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

const panels = [
  { id: 'projects', label: 'Projects' },
  { id: 'blog', label: 'Blog' },
  { id: 'stack', label: 'Stack' },
] as const

type PanelID = (typeof panels)[number]['id']

function Action({
  action,
  primary = false,
}: {
  action: { label: string; url: string }
  primary?: boolean
}) {
  const external = action.url.startsWith('http')
  return (
    <Button asChild variant={primary ? 'default' : 'outline'}>
      <Link
        href={action.url}
        rel={external ? 'noopener noreferrer' : undefined}
        target={external ? '_blank' : undefined}
      >
        {action.label} {primary && <ArrowUpRight aria-hidden="true" />}
      </Link>
    </Button>
  )
}

const pinnedPanelKey = 'portfolio:pinned-panel'

export function LandingExperience({ blogPosts, projects, settings, stack }: PortfolioHomeData) {
  const [activePanel, setActivePanel] = useState<PanelID>('projects')
  const [isPaused, setIsPaused] = useState(false)
  const [isDocumentHidden, setIsDocumentHidden] = useState(false)
  const [pinnedPanel, setPinnedPanel] = useState<PanelID | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [rotationNonce, setRotationNonce] = useState(0)

  const selectPanel = useCallback(
    (panel: PanelID, announce = true) => {
      setRotationNonce((value) => value + 1)
      setActivePanel(panel)
      if (pinnedPanel) {
        setPinnedPanel(panel)
        window.localStorage.setItem(pinnedPanelKey, panel)
      }
      if (announce) {
        setAnnouncement(`${panels.find((item) => item.id === panel)?.label} selected`)
      }
    },
    [pinnedPanel],
  )

  useEffect(() => {
    const stored = window.localStorage.getItem(pinnedPanelKey)
    if (stored !== 'projects' && stored !== 'blog' && stored !== 'stack') return

    const timer = window.setTimeout(() => {
      setPinnedPanel(stored)
      setActivePanel(stored)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (isPaused || isDocumentHidden || pinnedPanel || reducedMotion.matches) return

    const timer = window.setInterval(() => {
      setActivePanel((current) => {
        const index = panels.findIndex((panel) => panel.id === current)
        return panels[(index + 1) % panels.length].id
      })
    }, settings.carouselRotationInterval || 7000)

    return () => window.clearInterval(timer)
  }, [isDocumentHidden, isPaused, pinnedPanel, rotationNonce, settings.carouselRotationInterval])

  useEffect(() => {
    const onVisibilityChange = () => setIsDocumentHidden(document.hidden)
    onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  function togglePin() {
    if (pinnedPanel) {
      setPinnedPanel(null)
      window.localStorage.removeItem(pinnedPanelKey)
      setAnnouncement('Automatic panel rotation enabled')
      return
    }

    setPinnedPanel(activePanel)
    window.localStorage.setItem(pinnedPanelKey, activePanel)
    setAnnouncement(`${panels.find((panel) => panel.id === activePanel)?.label} pinned`)
  }

  return (
    <div className="landing-shell">
      <SiteHeader />
      <main className="landing-main mx-auto w-full max-w-6xl px-5 md:px-10">
        <section className="flex min-h-0 flex-col justify-center py-[clamp(1.25rem,4dvh,3rem)]">
          <p className="mb-[clamp(.75rem,2dvh,1.25rem)] font-mono text-xs text-terminal-green sm:text-sm">
            {settings.heroCommand}
          </p>
          <h1 className="max-w-4xl whitespace-pre-line font-mono text-[clamp(2.15rem,6.5dvh,4rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-balance">
            {settings.heroHeadline}
          </h1>
          <p className="mt-[clamp(.75rem,2.2dvh,1.5rem)] max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:text-lg">
            {settings.heroDescription}
          </p>
          <div className="mt-[clamp(1rem,2.5dvh,2rem)] flex flex-wrap gap-3">
            <Action action={settings.primaryAction} primary />
            <Button asChild variant="outline">
              <a href="/resume">
                ./resume <Download aria-hidden="true" />
              </a>
            </Button>
          </div>
        </section>

        <section
          aria-label="Portfolio overview"
          className="min-h-0"
          id="portfolio"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false)
          }}
          onFocus={() => setIsPaused(true)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="mb-3 flex items-end justify-between gap-4">
            <div className="min-w-0 overflow-x-auto">
              <div className="flex min-w-max items-center gap-1 font-mono text-xs" role="tablist">
                <span className="mr-1 text-terminal-purple">portfolio = [</span>
                {panels.map((panel, index) => (
                  <span className="flex items-center" key={panel.id}>
                    <button
                      aria-controls={`panel-${panel.id}`}
                      aria-selected={activePanel === panel.id}
                      className={cn(
                        'rounded px-2 py-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        activePanel === panel.id && 'bg-accent text-accent-foreground',
                      )}
                      id={`tab-${panel.id}`}
                      onClick={() => selectPanel(panel.id)}
                      role="tab"
                      type="button"
                    >
                      &quot;{panel.label}&quot;
                    </button>
                    {index < panels.length - 1 && <span className="text-muted-foreground">,</span>}
                  </span>
                ))}
                <span className="ml-1 text-terminal-purple">]</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
                {pinnedPanel
                  ? `pinned / ${pinnedPanel}`
                  : `auto / ${Math.round((settings.carouselRotationInterval || 7000) / 1000)}s`}
              </span>
              <Button
                aria-label={pinnedPanel ? 'Unpin portfolio panel' : `Pin ${activePanel} panel`}
                aria-pressed={Boolean(pinnedPanel)}
                className={pinnedPanel ? 'text-terminal-yellow' : undefined}
                onClick={togglePin}
                size="icon"
                title={pinnedPanel ? 'Resume automatic rotation' : 'Keep this panel selected'}
                variant="ghost"
              >
                {pinnedPanel ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
              </Button>
            </div>
          </div>

          <div className="portfolio-panel relative h-[clamp(15.5rem,36dvh,21rem)] overflow-hidden">
            {panels.map((panel) => (
              <div
                aria-labelledby={`tab-${panel.id}`}
                className={cn(
                  'absolute inset-0 transition-opacity duration-200 motion-reduce:transition-none',
                  activePanel === panel.id ? 'z-10 opacity-100' : 'pointer-events-none opacity-0',
                )}
                hidden={activePanel !== panel.id}
                id={`panel-${panel.id}`}
                key={panel.id}
                role="tabpanel"
              >
                {panel.id === 'projects' && <ProjectRail projects={projects} />}
                {panel.id === 'blog' && <HomeBlogPosts posts={blogPosts} />}
                {panel.id === 'stack' && (
                  <Card className="h-full gap-4 overflow-auto px-5 py-5 sm:px-6">
                    <div className="flex items-center justify-between gap-4 font-mono text-xs">
                      <p className="text-terminal-cyan">const stack = {'{'}</p>
                      <p className="text-muted-foreground">frequency ↓</p>
                    </div>
                    {stack.length ? (
                      <div className="flex flex-wrap content-start gap-2.5">
                        {stack.map((topic, index) => (
                          <Link
                            className="group inline-flex min-h-10 items-center gap-2 rounded-sm border border-border bg-background/20 px-3 font-mono text-xs text-foreground transition-colors hover:border-terminal-cyan/60 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            href={`/projects?topic=${topic.slug}`}
                            key={topic.slug}
                          >
                            <span className="text-terminal-purple">{topic.slug}</span>
                            <span
                              className="text-muted-foreground"
                              aria-label={`${topic.count} projects`}
                            >
                              {topic.count}
                            </span>
                            {index === 0 && (
                              <span
                                className="size-1.5 rounded-full bg-terminal-green"
                                aria-label="Most used"
                              />
                            )}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="font-mono text-sm text-muted-foreground">
                        <span className="text-terminal-yellow">warning:</span> no project topics yet
                      </p>
                    )}
                    <p className="mt-auto font-mono text-xs text-terminal-cyan">{'}'}</p>
                  </Card>
                )}
              </div>
            ))}
          </div>
          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </section>
      </main>
    </div>
  )
}
