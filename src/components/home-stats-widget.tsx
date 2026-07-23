import { ArrowUpRight, Clock3, Code2, GitCommitHorizontal } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getGitHubStats, getLeetCodeStats, getWakaTimeStats } from '@/lib/stats-data'

function CompactMetric({
  label,
  tone,
  value,
}: {
  label: string
  tone: string
  value: number | string
}) {
  return (
    <div className="rounded-md border border-border/70 bg-background/25 p-3 sm:p-4">
      <p className={`truncate font-mono text-lg font-semibold sm:text-xl ${tone}`}>{value}</p>
      <p className="mt-1 truncate font-mono text-[0.6875rem] text-muted-foreground">{label}</p>
    </div>
  )
}

export function HomeStatsFallback() {
  return (
    <Card className="grid h-full place-items-center px-5 py-5">
      <p className="font-mono text-xs text-muted-foreground">
        <span className="text-terminal-green">loading:</span> collecting developer telemetry…
      </p>
    </Card>
  )
}

export async function HomeStatsWidget() {
  const [leetcode, github, wakatime] = await Promise.all([
    getLeetCodeStats(),
    getGitHubStats(),
    getWakaTimeStats(),
  ])
  const activeProject =
    [...wakatime.daily].reverse().find((day) => day.projects.length)?.projects[0]?.name ||
    wakatime.projects[0]?.name

  return (
    <Card className="h-full gap-4 overflow-auto px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-terminal-cyan">telemetry.snapshot()</p>
          <p className="mt-1 text-xs text-muted-foreground">Live metrics, cached for 15 minutes.</p>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[0.6875rem] text-terminal-green">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-terminal-green" />
          live
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <CompactMetric
          label="LeetCode solved"
          tone="text-terminal-green"
          value={leetcode.available ? leetcode.solved.total : '—'}
        />
        <CompactMetric
          label="GitHub repos"
          tone="text-terminal-blue"
          value={github.available ? github.publicRepos : '—'}
        />
        <CompactMetric
          label="private commits"
          tone="text-terminal-purple"
          value={github.privateCommits ?? '—'}
        />
        <CompactMetric
          label="coding this week"
          tone="text-terminal-yellow"
          value={wakatime.available ? wakatime.totalThisWeek : '—'}
        />
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.6875rem] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Code2 aria-hidden="true" className="size-3 text-terminal-green" />
          {leetcode.solved.medium} medium solved
        </span>
        <span className="inline-flex items-center gap-1.5">
          <GitCommitHorizontal aria-hidden="true" className="size-3 text-terminal-purple" />
          {github.totalContributions || '—'} yearly contributions
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Clock3 aria-hidden="true" className="size-3 shrink-0 text-terminal-blue" />
          <span className="truncate">{activeProject || 'WakaTime not configured'}</span>
        </span>
      </div>

      <Button asChild className="mt-auto w-full sm:w-fit" variant="outline">
        <Link href="/stats">
          ./view-all-stats <ArrowUpRight aria-hidden="true" />
        </Link>
      </Button>
    </Card>
  )
}
