import { AlertCircle, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function StatsPanel({
  children,
  className,
  eyebrow,
  href,
  title,
}: {
  children: ReactNode
  className?: string
  eyebrow: string
  href?: string
  title: string
}) {
  return (
    <section className={cn('rounded-lg border border-border bg-card/45 p-4 sm:p-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-terminal-green">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-lg font-semibold">{title}</h2>
        </div>
        {href ? (
          <Link
            className="flex min-h-11 shrink-0 items-center gap-1 rounded-md px-2 font-mono text-xs text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
            href={href}
          >
            inspect
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
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
      <p className="mt-1 truncate font-mono text-[0.6875rem] text-muted-foreground">{label}</p>
    </div>
  )
}

export function StatsUnavailable({
  detail,
  label,
}: {
  detail?: string
  label: string
}) {
  return (
    <div className="mt-6 flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-background/30 p-5 text-center">
      <div>
        <AlertCircle aria-hidden="true" className="mx-auto size-5 text-terminal-yellow" />
        <p className="mt-3 font-mono text-sm text-foreground">{label} unavailable</p>
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

export function ContributionDots({
  days,
}: {
  days: { count: number; date: string }[]
}) {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const counts = new Map(days.map((day) => [day.date, day.count]))
  const cells = Array.from({ length: 30 }, (_, index) => {
    const day = new Date(today)
    day.setUTCDate(today.getUTCDate() - (29 - index))
    const date = day.toISOString().slice(0, 10)
    return { count: counts.get(date) || 0, date }
  })

  const intensity = (count: number) => {
    if (count === 0) return 'border-border/70 bg-muted/60'
    if (count <= 2) return 'border-terminal-green/20 bg-terminal-green/25'
    if (count <= 5) return 'border-terminal-green/35 bg-terminal-green/45'
    if (count <= 9) return 'border-terminal-green/50 bg-terminal-green/65'
    return 'border-terminal-green/70 bg-terminal-green'
  }

  return (
    <div className="mt-6 border-t border-border/70 pt-5">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-xs text-muted-foreground">Last 30 days</p>
        <p className="font-mono text-[0.6875rem] text-terminal-green">
          {cells.reduce((total, cell) => total + cell.count, 0)} contributions
        </p>
      </div>
      <div
        aria-label="GitHub contribution activity for the last 30 days"
        className="scrollbar-thin mt-3 overflow-x-auto pb-1"
        role="img"
      >
        <div className="grid w-max grid-cols-[repeat(10,0.75rem)] gap-1 sm:grid-cols-[repeat(15,0.75rem)] lg:grid-cols-[repeat(30,0.75rem)]">
          {cells.map((cell) => (
            <span
              aria-label={`${cell.count} contributions on ${cell.date}`}
              className={cn('size-3 rounded-[2px] border', intensity(cell.count))}
              key={cell.date}
              title={`${cell.date}: ${cell.count} contributions`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    date,
  )
}
