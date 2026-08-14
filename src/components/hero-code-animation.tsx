'use client'

import { useEffect, useState } from 'react'

const stages = [
  {
    command: 'pnpm build',
    detail: '42 modules compiled',
    label: 'BUILD',
    progress: 44,
  },
  {
    command: 'go test ./...',
    detail: '18 packages passing',
    label: 'TEST',
    progress: 72,
  },
  {
    command: 'git push origin main',
    detail: 'release at the edge',
    label: 'SHIP',
    progress: 100,
  },
] as const

export function HeroCodeAnimation() {
  const [stage, setStage] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(true)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReduceMotion(preference.matches)
    updatePreference()
    preference.addEventListener('change', updatePreference)
    return () => preference.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (reduceMotion) return
    const timer = window.setInterval(() => {
      setStage((current) => (current + 1) % stages.length)
    }, 1800)
    return () => window.clearInterval(timer)
  }, [reduceMotion])

  const active = stages[stage]

  return (
    <div aria-hidden="true" className="pointer-events-none relative hidden select-none md:block">
      <div className="absolute -inset-8 rounded-full bg-terminal-blue/5 blur-3xl" />
      <div className="relative overflow-hidden rounded-md border border-border/80 bg-card/55 shadow-2xl shadow-black/25 backdrop-blur-sm">
        <div className="flex h-9 items-center gap-1.5 border-b border-border/70 px-3">
          <span className="size-1.5 rounded-full bg-terminal-red/80" />
          <span className="size-1.5 rounded-full bg-terminal-yellow/80" />
          <span className="size-1.5 rounded-full bg-terminal-green/80" />
          <span className="ml-2 font-mono text-[10px] text-muted-foreground">pipeline.dev</span>
          <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-terminal-green">
            <span className="size-1.5 animate-pulse rounded-full bg-terminal-green motion-reduce:animate-none" />
            live
          </span>
        </div>

        <div className="relative space-y-4 p-4 font-mono text-[11px] leading-5 lg:p-5 lg:text-xs">
          <div className="absolute inset-y-0 left-0 w-px animate-[terminal-scan_2.8s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-terminal-blue/60 to-transparent motion-reduce:hidden" />
          <div className="grid grid-cols-[1.5rem_1fr] text-muted-foreground">
            <span>01</span>
            <span><b className="font-normal text-terminal-purple">const</b> craft = <b className="font-normal text-terminal-cyan">async</b> () =&gt; {'{'}</span>
            <span>02</span>
            <span className="pl-3"><b className="font-normal text-terminal-purple">await</b> design.withIntent()</span>
            <span>03</span>
            <span className="pl-3"><b className="font-normal text-terminal-purple">return</b> ship.reliably()<span className="ml-1 inline-block h-3 w-px animate-pulse bg-terminal-green align-middle motion-reduce:animate-none" /></span>
            <span>04</span>
            <span>{'}'}</span>
          </div>

          <div className="border-t border-border/60 pt-3">
            <div className="flex items-center gap-2 text-foreground">
              <span className="text-terminal-green">❯</span>
              <span key={active.command} className="animate-[terminal-enter_.25s_ease-out] motion-reduce:animate-none">
                {active.command}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="w-10 text-terminal-yellow">{active.label}</span>
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-terminal-green to-terminal-blue transition-[width] duration-700 motion-reduce:transition-none"
                  style={{ width: `${reduceMotion ? 100 : active.progress}%` }}
                />
              </span>
              <span className="w-28 text-right text-muted-foreground">{active.detail}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-[88%] items-center justify-between border-x border-b border-border/50 px-3 py-1.5 font-mono text-[9px] text-muted-foreground">
        <span>main</span>
        <span className="text-terminal-green">build ── test ── deploy</span>
      </div>
    </div>
  )
}
