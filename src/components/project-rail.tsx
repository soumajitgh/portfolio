'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { ProjectCard } from '@/components/project-card'
import { Button } from '@/components/ui/button'
import type { ProjectCardData } from '@/lib/portfolio-data'

export function ProjectRail({ projects }: { projects: ProjectCardData[] }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(projects.length > 1)

  const updateControls = useCallback(() => {
    const rail = railRef.current
    if (!rail) return
    setCanGoBack(rail.scrollLeft > 4)
    setCanGoForward(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 4)
  }, [])

  useEffect(() => {
    updateControls()
    const rail = railRef.current
    if (!rail) return
    const observer = new ResizeObserver(updateControls)
    observer.observe(rail)
    return () => observer.disconnect()
  }, [updateControls])

  function move(direction: -1 | 1) {
    const rail = railRef.current
    if (!rail) return
    const firstCard = rail.firstElementChild as HTMLElement | null
    rail.scrollBy({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      left: direction * ((firstCard?.offsetWidth || rail.clientWidth * 0.88) + 16),
    })
  }

  if (!projects.length) {
    return (
      <div className="grid h-full place-items-center rounded-lg border border-dashed border-border px-6 text-center font-mono text-sm text-muted-foreground">
        <p>
          <span className="text-terminal-yellow">warning:</span> no featured projects yet
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      <div className="absolute -top-11 right-0 hidden gap-2 md:flex">
        <Button
          aria-label="Previous projects"
          disabled={!canGoBack}
          onClick={() => move(-1)}
          size="icon"
          variant="outline"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button
          aria-label="Next projects"
          disabled={!canGoForward}
          onClick={() => move(1)}
          size="icon"
          variant="outline"
        >
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
      <div
        aria-label="Featured projects"
        className="scrollbar-thin mobile-scrollbar-hidden flex h-full touch-pan-x snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pr-[12%] md:pb-3"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            move(-1)
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            move(1)
          }
        }}
        onScroll={updateControls}
        onWheel={(event) => {
          if (window.innerWidth < 768 || !window.matchMedia('(pointer: fine)').matches) return
          if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
          event.currentTarget.scrollLeft += event.deltaY
        }}
        ref={railRef}
        role="region"
        tabIndex={0}
      >
        {projects.map((project, index) => (
          <div className="h-full w-[88%] shrink-0 snap-start sm:w-96 lg:w-[27rem]" key={project.id}>
            <ProjectCard compact index={index} project={project} />
          </div>
        ))}
      </div>
      {canGoForward && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  )
}
