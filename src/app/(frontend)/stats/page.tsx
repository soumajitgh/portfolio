import type { Metadata } from 'next'

import { GitHubTelemetry } from '@/components/stats/github-telemetry'
import { LeetCodeTelemetry } from '@/components/stats/leetcode-telemetry'
import { getGitHubStats, getLeetCodeStats } from '@/lib/stats-data'

const title = 'Developer Stats'
const description =
  'GitHub repositories and contributions, plus LeetCode problem-solving, contests, and submissions for Soumajit Ghosh.'

export const metadata: Metadata = {
  alternates: { canonical: '/stats' },
  description,
  openGraph: { description, title, type: 'website', url: '/stats' },
  title,
  twitter: { card: 'summary_large_image', description, title },
}

export const revalidate = 900

export default async function StatsPage() {
  const [github, leetcode] = await Promise.all([getGitHubStats(), getLeetCodeStats()])

  return (
    <main className="page-container py-10 sm:py-12 md:py-16">
      <p className="font-mono text-xs text-terminal-green sm:text-sm">
        soumajit@portfolio:<span className="text-terminal-blue">~</span>$ watch ./stats
      </p>
      <h1 className="page-title mt-4 font-bold">Developer telemetry</h1>
      <p className="page-lede mt-3 max-w-2xl text-muted-foreground">
        Open-source activity on GitHub and problem-solving progress on LeetCode.
      </p>

      <nav aria-label="Telemetry sections" className="mt-6 flex flex-wrap gap-3">
        {[
          { id: 'github', label: 'GitHub' },
          { id: 'leetcode', label: 'LeetCode' },
        ].map(({ id, label }) => (
          <a
            className="inline-flex min-h-11 items-center rounded-md border border-input bg-card/45 px-4 text-xs font-medium text-primary transition-colors hover:bg-accent"
            href={`#${id}`}
            key={id}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-10 space-y-12 sm:space-y-16">
        <GitHubTelemetry stats={github} />
        <LeetCodeTelemetry stats={leetcode} />
      </div>
    </main>
  )
}
