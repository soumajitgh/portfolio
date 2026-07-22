'use client'

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { ProjectRail } from '@/components/project-rail'
import { SiteHeader } from '@/components/site-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatLabel } from '@/lib/content'
import type { PortfolioHomeData } from '@/lib/portfolio-data'
import { cn } from '@/lib/utils'

const panels = [
  { id: 'projects', label: 'Selected Work' },
  { id: 'interests', label: 'Interests' },
  { id: 'skills', label: 'Skills' },
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

export function LandingExperience({ projects, settings }: PortfolioHomeData) {
  const [activePanel, setActivePanel] = useState<PanelID>('projects')
  const [isPaused, setIsPaused] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [rotationNonce, setRotationNonce] = useState(0)

  const selectPanel = useCallback((panel: PanelID, announce = true) => {
    setRotationNonce((value) => value + 1)
    setActivePanel(panel)
    if (announce) {
      setAnnouncement(`${panels.find((item) => item.id === panel)?.label} selected`)
    }
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (isPaused || reducedMotion.matches || document.hidden) return

    const timer = window.setInterval(() => {
      if (document.hidden) return
      setActivePanel((current) => {
        const index = panels.findIndex((panel) => panel.id === current)
        return panels[(index + 1) % panels.length].id
      })
    }, settings.carouselRotationInterval || 7000)

    return () => window.clearInterval(timer)
  }, [isPaused, rotationNonce, settings.carouselRotationInterval])

  useEffect(() => {
    const onVisibilityChange = () => setIsPaused(document.hidden)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return (
    <div className="landing-shell">
      <SiteHeader />
      <main className="landing-main mx-auto w-full max-w-6xl px-5 md:px-10">
        <section className="flex min-h-0 flex-col justify-center py-[clamp(1.25rem,4dvh,3rem)]">
          <p className="mb-[clamp(.75rem,2dvh,1.25rem)] font-mono text-xs text-terminal-green sm:text-sm">
            {settings.heroCommand}
          </p>
          <h1 className="max-w-4xl font-mono text-[clamp(2.15rem,6.5dvh,4rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-balance">
            {settings.heroHeadline}
          </h1>
          <p className="mt-[clamp(.75rem,2.2dvh,1.5rem)] max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:text-lg">
            {settings.heroDescription}
          </p>
          <div className="mt-[clamp(1rem,2.5dvh,2rem)] flex flex-wrap gap-3">
            <Action action={settings.primaryAction} primary />
            <Action action={settings.secondaryAction} />
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
                <span className="mr-1 text-terminal-purple">selectedWork = [</span>
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
            <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:inline">
              auto / {Math.round((settings.carouselRotationInterval || 7000) / 1000)}s
            </span>
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
                {panel.id === 'interests' && (
                  <Card className="h-full overflow-auto py-3">
                    <div className="grid gap-0 px-4 md:grid-cols-2">
                      {settings.interests?.length ? (
                        settings.interests.map((interest, index) => (
                          <div
                            className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-border/60 px-2 py-2.5 last:border-0 md:[&:nth-last-child(-n+2)]:border-b-0"
                            key={interest.id || interest.name}
                          >
                            <span className="font-mono text-xs text-terminal-yellow">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h3 className="text-sm font-medium tracking-normal">
                                {interest.name}
                              </h3>
                              {interest.description && (
                                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                                  {interest.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 font-mono text-sm text-muted-foreground">
                          <span className="text-terminal-yellow">warning:</span> interests are not
                          configured
                        </p>
                      )}
                    </div>
                  </Card>
                )}
                {panel.id === 'skills' && (
                  <div className="scrollbar-thin flex h-full snap-x gap-4 overflow-x-auto pb-3 pr-[10vw]">
                    {settings.skills?.length ? (
                      settings.skills.map((group) => (
                        <Card
                          className="h-full min-w-[78vw] snap-start gap-3 overflow-auto px-5 py-4 sm:min-w-[20rem]"
                          key={group.id || group.category}
                        >
                          <h3 className="text-sm font-semibold text-terminal-cyan">
                            {formatLabel(group.category)}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {group.items.map((skill) => (
                              <Badge key={skill.id || skill.name} variant="outline">
                                {skill.name}
                                {skill.proficiency && (
                                  <span className="text-terminal-purple">
                                    · {skill.proficiency}
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </Card>
                      ))
                    ) : (
                      <Card className="h-full w-full p-5 font-mono text-sm text-muted-foreground">
                        <p>
                          <span className="text-terminal-yellow">warning:</span> skills are not
                          configured
                        </p>
                      </Card>
                    )}
                  </div>
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
