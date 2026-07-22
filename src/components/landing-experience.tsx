'use client'

import { Pin, PinOff } from 'lucide-react'
import Link from 'next/link'
import { type KeyboardEvent, useCallback, useEffect, useState } from 'react'

import { HomeBlogPosts } from '@/components/home-blog-posts'
import { ProjectRail } from '@/components/project-rail'
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

const pinnedPanelKey = 'portfolio:pinned-panel'

export function PortfolioShowcase({ blogPosts, projects, settings, stack }: PortfolioHomeData) {
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

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, panel: PanelID) {
    const currentIndex = panels.findIndex((item) => item.id === panel)
    let nextIndex = currentIndex

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % panels.length
    else if (event.key === 'ArrowLeft')
      nextIndex = (currentIndex - 1 + panels.length) % panels.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = panels.length - 1
    else return

    event.preventDefault()
    const nextPanel = panels[nextIndex]
    selectPanel(nextPanel.id)
    document.getElementById(`tab-${nextPanel.id}`)?.focus()
  }

  return (
    <section
      aria-label="Portfolio overview"
      className="min-h-0 border-t border-border/60 pt-4 sm:border-t-0 sm:pt-0"
      id="portfolio"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false)
      }}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mb-2 flex items-end justify-between gap-4 sm:mb-3">
        <div className="scrollbar-thin mobile-scrollbar-hidden min-w-0 overflow-x-auto overscroll-x-contain">
          <div
            className="flex min-w-max items-center gap-2 font-mono text-xs sm:gap-1"
            role="tablist"
          >
            <span className="mr-1 hidden text-terminal-purple sm:inline">portfolio = [</span>
            {panels.map((panel, index) => (
              <span className="flex items-center" key={panel.id}>
                <button
                  aria-controls={`panel-${panel.id}`}
                  aria-selected={activePanel === panel.id}
                  className={cn(
                    'min-h-11 rounded px-3 py-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    activePanel === panel.id && 'bg-accent text-accent-foreground',
                  )}
                  id={`tab-${panel.id}`}
                  onClick={() => selectPanel(panel.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, panel.id)}
                  role="tab"
                  tabIndex={activePanel === panel.id ? 0 : -1}
                  type="button"
                >
                  &quot;{panel.label}&quot;
                </button>
                {index < panels.length - 1 && (
                  <span className="hidden text-muted-foreground sm:inline">,</span>
                )}
              </span>
            ))}
            <span className="ml-1 hidden text-terminal-purple sm:inline">]</span>
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

      <div className="portfolio-panel relative h-[19rem] overflow-hidden sm:h-[clamp(15.5rem,36dvh,21rem)]">
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
                        className="group inline-flex min-h-11 max-w-full items-center gap-2 rounded-sm border border-border bg-background/20 px-3 font-mono text-xs text-foreground transition-colors hover:border-terminal-cyan/60 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
  )
}
