import { AlertCircle, ExternalLink } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function StatsSection({
  children,
  id,
  profileURL,
  title,
  username,
}: {
  children: ReactNode
  id: string
  profileURL: string
  title: string
  username: string
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="scroll-mt-24" id={id}>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl" id={`${id}-heading`}>
            {title}
          </h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">@{username}</p>
        </div>
        <a
          aria-label={`View ${title} profile`}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-input px-3 text-xs font-medium text-primary transition-colors hover:bg-accent"
          href={profileURL}
          rel="noreferrer"
          target="_blank"
        >
          View profile
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </header>
      {children}
    </section>
  )
}

export function StatsPanel({
  children,
  className,
  title,
}: {
  children: ReactNode
  className?: string
  title: string
}) {
  return (
    <div className={cn('min-w-0 rounded-lg border border-border bg-card/45 p-4 sm:p-6', className)}>
      <h3 className="text-lg font-bold">{title}</h3>
      {children}
    </div>
  )
}

export function StatValue({
  label,
  tone = 'blue',
  value,
}: {
  label: string
  tone?: 'blue' | 'cyan' | 'green' | 'purple' | 'yellow'
  value: ReactNode
}) {
  const tones = {
    blue: 'text-terminal-blue',
    cyan: 'text-terminal-cyan',
    green: 'text-terminal-green',
    purple: 'text-terminal-purple',
    yellow: 'text-terminal-yellow',
  }

  return (
    <div className="min-w-0">
      <p className={cn('font-mono text-xl font-semibold sm:text-2xl', tones[tone])}>{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

export function StatsUnavailable({ detail, label }: { detail?: string; label: string }) {
  return (
    <div className="mt-6 flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-background/30 p-5 text-center">
      <div>
        <AlertCircle aria-hidden="true" className="mx-auto size-5 text-terminal-yellow" />
        <p className="mt-3 text-sm text-foreground">{label} unavailable</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {detail || 'The upstream service did not return data. Try again shortly.'}
        </p>
      </div>
    </div>
  )
}

export function Rank({ value }: { value: number }) {
  return value ? `#${new Intl.NumberFormat('en').format(Math.round(value))}` : '—'
}

export function ContributionDots({ days }: { days: { count: number; date: string }[] }) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const counts = new Map(days.map((day) => [day.date, day.count]))
  const calendarStart = new Date(today)
  calendarStart.setUTCDate(today.getUTCDate() - today.getUTCDay() - 52 * 7)
  const cells = Array.from({ length: 53 * 7 }, (_, index) => {
    const day = new Date(calendarStart)
    day.setUTCDate(calendarStart.getUTCDate() + index)
    const date = day.toISOString().slice(0, 10)
    return { count: counts.get(date) || 0, date, future: day > today }
  })
  const visibleCells = cells.filter((cell) => !cell.future)

  const intensity = (count: number) => {
    if (count === 0) return 'border-border/70 bg-muted/60'
    if (count <= 2) return 'border-terminal-green/20 bg-terminal-green/25'
    if (count <= 5) return 'border-terminal-green/35 bg-terminal-green/45'
    if (count <= 9) return 'border-terminal-green/50 bg-terminal-green/65'
    return 'border-terminal-green/70 bg-terminal-green'
  }

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">Last 12 months</p>
        <p className="font-mono text-[0.6875rem] text-terminal-green">
          {visibleCells.reduce((total, cell) => total + cell.count, 0)} contributions
        </p>
      </div>
      <div
        aria-label="GitHub contribution activity for the last 12 months"
        className="scrollbar-thin mt-3 overflow-x-auto pb-1"
        role="img"
      >
        <div className="grid w-max min-w-full grid-flow-col grid-rows-7 gap-1">
          {cells.map((cell) => (
            <span
              aria-hidden={cell.future || undefined}
              aria-label={cell.future ? undefined : `${cell.count} contributions on ${cell.date}`}
              className={cn(
                'h-3 min-w-3 rounded-[2px] border',
                cell.future ? 'border-transparent bg-transparent' : intensity(cell.count),
              )}
              key={cell.date}
              title={cell.future ? undefined : `${cell.date}: ${cell.count} contributions`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function formatDate(value?: Date | string) {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    date,
  )
}
