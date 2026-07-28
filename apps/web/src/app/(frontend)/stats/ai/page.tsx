import { ArrowLeft, Clock3, ExternalLink, Gauge, MessageSquareText, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { AIUsageCharts } from '@/components/stats/stats-charts'
import { StatValue, StatsPanel, StatsUnavailable } from '@/components/stats/stats-ui'
import { getWakaTimeStats } from '@/lib/stats-data'

export const metadata: Metadata = {
  alternates: { canonical: '/stats/ai' },
  description:
    'Detailed AI-assisted coding, model, prompt, token, cost, and line-change metrics from WakaTime for fullstack developer Soumajit Ghosh.',
  openGraph: {
    description:
      'Detailed AI-assisted coding, model, prompt, token, cost, and line-change metrics from WakaTime.',
    title: 'AI Usage Stats',
    type: 'website',
    url: '/stats/ai',
  },
  title: 'AI Usage Stats',
  twitter: {
    card: 'summary_large_image',
    description: 'AI-assisted engineering usage and efficiency metrics from WakaTime.',
    title: 'AI Usage Stats',
  },
}

export const revalidate = 900

const compactNumber = (value: number) =>
  new Intl.NumberFormat('en', { maximumFractionDigits: 1, notation: 'compact' }).format(value)

const preciseNumber = (value: number, maximumFractionDigits = 1) =>
  new Intl.NumberFormat('en', { maximumFractionDigits }).format(value)

const money = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits,
    minimumFractionDigits: 2,
    style: 'currency',
  }).format(value)

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(
    new Date(`${value}T00:00:00`),
  )

export default async function AIStatsPage() {
  const wakatime = await getWakaTimeStats()
  const usage = wakatime.ai
  const totalLineChanges = usage.lineChanges + usage.humanLineChanges
  const linesPerSession = usage.sessions ? usage.lineChanges / usage.sessions : 0
  const outputTokensPerLine = usage.lineChanges ? usage.outputTokens / usage.lineChanges : 0
  const costPerThousandLines = usage.lineChanges ? (usage.totalCost / usage.lineChanges) * 1_000 : 0
  const inputOutputRatio = usage.inputTokens ? usage.outputTokens / usage.inputTokens : 0
  const activeDays = usage.daily.filter(
    (day) => day.aiLines > 0 || day.humanLines > 0 || day.prompts > 0 || day.sessions > 0,
  )

  const unavailableDetail =
    wakatime.error === 'WAKATIME_API_KEY is not configured'
      ? 'Add WAKATIME_API_KEY to the server environment to load private AI usage metrics.'
      : wakatime.available
        ? 'WakaTime did not report AI activity for this range. An AI-enabled WakaTime plugin must send model, prompt, or line-change telemetry first.'
        : wakatime.error

  return (
    <main className="page-container py-10 sm:py-12 md:py-16">
      <Link
        className="inline-flex min-h-11 items-center gap-2 font-mono text-xs text-muted-foreground hover:text-primary"
        href="/stats"
      >
        <ArrowLeft aria-hidden="true" className="size-3.5" />
        ../stats
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-mono text-xs text-terminal-green">wakatime / ai telemetry</p>
          <h1 className="detail-title mt-3 font-semibold">AI-assisted engineering</h1>
          <p className="detail-lede mt-3 max-w-2xl text-muted-foreground">
            A detailed view of AI-generated code, model mix, prompting behavior, token flow, and
            estimated cost.
          </p>
        </div>
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 font-mono text-xs text-primary transition-colors hover:border-primary/60 hover:bg-accent"
          href="https://wakatime.com/ai"
          rel="noreferrer"
          target="_blank"
        >
          WakaTime AI
          <ExternalLink aria-hidden="true" className="size-3.5" />
        </a>
      </div>

      {!wakatime.available || !usage.available ? (
        <StatsUnavailable detail={unavailableDetail} label="AI usage metrics" />
      ) : (
        <>
          <div className="mt-9 grid grid-cols-2 gap-4 rounded-lg border border-border bg-card/45 p-4 sm:grid-cols-3 sm:p-6 lg:grid-cols-6">
            <StatValue
              label="AI line changes"
              tone="purple"
              value={compactNumber(usage.lineChanges)}
            />
            <StatValue
              label="AI line share"
              tone="green"
              value={`${usage.adoptionPercent.toFixed(1)}%`}
            />
            <StatValue label="prompt events" value={compactNumber(usage.promptEvents)} />
            <StatValue label="AI sessions" tone="cyan" value={compactNumber(usage.sessions)} />
            <StatValue
              label="output tokens"
              tone="yellow"
              value={compactNumber(usage.outputTokens)}
            />
            <StatValue label="estimated cost" tone="yellow" value={money(usage.totalCost)} />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <StatsPanel className="lg:col-span-2" eyebrow="output mix" title="AI and human changes">
              <AIUsageCharts usage={usage} />
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border/70 pt-5 sm:grid-cols-4">
                <StatValue
                  label="AI additions"
                  tone="green"
                  value={compactNumber(usage.additions)}
                />
                <StatValue
                  label="AI deletions"
                  tone="purple"
                  value={compactNumber(usage.deletions)}
                />
                <StatValue label="human changes" value={compactNumber(usage.humanLineChanges)} />
                <StatValue
                  label="tracked changes"
                  tone="cyan"
                  value={compactNumber(totalLineChanges)}
                />
              </div>
            </StatsPanel>

            <StatsPanel eyebrow="interaction" title="Prompt and session depth">
              <dl className="mt-6 space-y-4 text-sm">
                {[
                  ['prompts / session', preciseNumber(usage.promptsPerSession)],
                  [
                    'median prompts / session',
                    usage.medianPromptsPerSession
                      ? preciseNumber(usage.medianPromptsPerSession)
                      : '—',
                  ],
                  [
                    'average prompt length',
                    usage.averagePromptCharacters
                      ? `${compactNumber(usage.averagePromptCharacters)} chars`
                      : '—',
                  ],
                  ['total prompt text', `${compactNumber(usage.promptCharacters)} chars`],
                  ['AI coding time', usage.aiCodingTime],
                ].map(([label, value]) => (
                  <div
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border/60 pb-3"
                    key={label}
                  >
                    <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-right font-mono text-xs text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <MessageSquareText
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-terminal-purple"
                />
                Prompt depth describes interaction patterns. It does not measure prompt quality or
                task difficulty.
              </p>
            </StatsPanel>

            <StatsPanel eyebrow="efficiency" title="Token and cost signals">
              <dl className="mt-6 space-y-4 text-sm">
                {[
                  ['input tokens', compactNumber(usage.inputTokens)],
                  ['output tokens', compactNumber(usage.outputTokens)],
                  [
                    'output / input ratio',
                    inputOutputRatio ? `${preciseNumber(inputOutputRatio, 2)}×` : '—',
                  ],
                  [
                    'output tokens / AI line',
                    outputTokensPerLine ? preciseNumber(outputTokensPerLine) : '—',
                  ],
                  ['AI lines / session', linesPerSession ? preciseNumber(linesPerSession) : '—'],
                  [
                    'cost / 1k AI lines',
                    costPerThousandLines ? money(costPerThousandLines, 3) : '—',
                  ],
                ].map(([label, value]) => (
                  <div
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-border/60 pb-3"
                    key={label}
                  >
                    <dt className="font-mono text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-right font-mono text-xs text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 flex gap-2 text-xs leading-relaxed text-muted-foreground">
                <Gauge
                  aria-hidden="true"
                  className="mt-0.5 size-3.5 shrink-0 text-terminal-yellow"
                />
                Efficiency ratios are derived from WakaTime totals and become more stable over
                larger samples.
              </p>
            </StatsPanel>

            <StatsPanel className="lg:col-span-2" eyebrow="attribution" title="Model impact">
              {usage.models.length ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[38rem] text-left">
                    <thead>
                      <tr className="border-b border-border font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                        <th className="pb-3 pr-4 font-normal">model</th>
                        <th className="pb-3 pr-4 text-right font-normal">line changes</th>
                        <th className="pb-3 pr-4 text-right font-normal">share</th>
                        <th className="pb-3 pr-4 text-right font-normal">estimated cost</th>
                        <th className="pb-3 text-right font-normal">cost / 1k lines</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {usage.models.map((model) => {
                        const share = usage.lineChanges
                          ? (model.lines / usage.lineChanges) * 100
                          : 0
                        const modelUnitCost = model.lines ? (model.cost / model.lines) * 1_000 : 0

                        return (
                          <tr className="font-mono text-xs" key={model.name}>
                            <td className="py-3 pr-4 text-terminal-purple">{model.name}</td>
                            <td className="py-3 pr-4 text-right text-foreground">
                              {preciseNumber(model.lines, 0)}
                            </td>
                            <td className="py-3 pr-4 text-right text-muted-foreground">
                              {share.toFixed(1)}%
                            </td>
                            <td className="py-3 pr-4 text-right text-muted-foreground">
                              {money(model.cost)}
                            </td>
                            <td className="py-3 text-right text-muted-foreground">
                              {modelUnitCost ? money(modelUnitCost, 3) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <StatsUnavailable
                  detail="The API returned aggregate AI usage without model-level attribution."
                  label="Model breakdown"
                />
              )}
            </StatsPanel>

            <StatsPanel className="lg:col-span-2" eyebrow="workload" title="Project adoption">
              {usage.projects.length ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[42rem] text-left">
                    <thead>
                      <tr className="border-b border-border font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                        <th className="pb-3 pr-4 font-normal">project</th>
                        <th className="pb-3 pr-4 text-right font-normal">AI changes</th>
                        <th className="pb-3 pr-4 text-right font-normal">human changes</th>
                        <th className="pb-3 pr-4 text-right font-normal">AI share</th>
                        <th className="pb-3 pr-4 text-right font-normal">prompts</th>
                        <th className="pb-3 text-right font-normal">cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {usage.projects.map((project) => (
                        <tr className="font-mono text-xs" key={project.name}>
                          <td className="max-w-52 truncate py-3 pr-4 text-terminal-blue">
                            {project.name}
                          </td>
                          <td className="py-3 pr-4 text-right text-foreground">
                            {preciseNumber(project.aiLines, 0)}
                          </td>
                          <td className="py-3 pr-4 text-right text-muted-foreground">
                            {preciseNumber(project.humanLines, 0)}
                          </td>
                          <td className="py-3 pr-4 text-right text-terminal-green">
                            {project.adoptionPercent.toFixed(1)}%
                          </td>
                          <td className="py-3 pr-4 text-right text-muted-foreground">
                            {preciseNumber(project.prompts, 0)}
                          </td>
                          <td className="py-3 text-right text-muted-foreground">
                            {money(project.cost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <StatsUnavailable
                  detail="The API returned aggregate AI usage without project-level attribution."
                  label="Project breakdown"
                />
              )}
            </StatsPanel>

            <StatsPanel className="lg:col-span-2" eyebrow="timeline" title="Daily telemetry">
              {activeDays.length ? (
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[44rem] text-left">
                    <thead>
                      <tr className="border-b border-border font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                        <th className="pb-3 pr-4 font-normal">day</th>
                        <th className="pb-3 pr-4 text-right font-normal">AI lines</th>
                        <th className="pb-3 pr-4 text-right font-normal">human lines</th>
                        <th className="pb-3 pr-4 text-right font-normal">prompts</th>
                        <th className="pb-3 pr-4 text-right font-normal">sessions</th>
                        <th className="pb-3 pr-4 text-right font-normal">tokens</th>
                        <th className="pb-3 text-right font-normal">cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {[...activeDays].reverse().map((day) => (
                        <tr className="font-mono text-xs" key={day.date}>
                          <td className="py-3 pr-4 text-terminal-cyan">{dateLabel(day.date)}</td>
                          <td className="py-3 pr-4 text-right text-terminal-purple">
                            {preciseNumber(day.aiLines, 0)}
                          </td>
                          <td className="py-3 pr-4 text-right text-muted-foreground">
                            {preciseNumber(day.humanLines, 0)}
                          </td>
                          <td className="py-3 pr-4 text-right text-muted-foreground">
                            {preciseNumber(day.prompts, 0)}
                          </td>
                          <td className="py-3 pr-4 text-right text-muted-foreground">
                            {preciseNumber(day.sessions, 0)}
                          </td>
                          <td className="py-3 pr-4 text-right text-muted-foreground">
                            {compactNumber(day.inputTokens + day.outputTokens)}
                          </td>
                          <td className="py-3 text-right text-muted-foreground">
                            {money(day.cost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <StatsUnavailable label="Daily AI telemetry" />
              )}
            </StatsPanel>

            <StatsPanel
              className="lg:col-span-2"
              eyebrow="context"
              title="How to read these metrics"
            >
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-border/70 bg-background/25 p-4">
                  <Sparkles aria-hidden="true" className="size-4 text-terminal-purple" />
                  <h3 className="mt-3 font-mono text-xs text-foreground">AI line share</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    AI line changes divided by all tracked AI and human line changes. It describes
                    adoption, not code quality.
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/25 p-4">
                  <MessageSquareText aria-hidden="true" className="size-4 text-terminal-green" />
                  <h3 className="mt-3 font-mono text-xs text-foreground">Sessions and prompts</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Distinct AI work sessions and recorded prompt events reveal interaction
                    intensity without exposing prompt content.
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/25 p-4">
                  <Clock3 aria-hidden="true" className="size-4 text-terminal-yellow" />
                  <h3 className="mt-3 font-mono text-xs text-foreground">Collection window</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Totals use WakaTime&apos;s {wakatime.range.toLowerCase()} stats window; the
                    daily chart spans the latest 14 calendar days.
                  </p>
                </div>
              </div>
              <p className="mt-5 border-t border-border/70 pt-4 font-mono text-[0.6875rem] leading-relaxed text-muted-foreground">
                Source: WakaTime Stats and Summaries APIs · cached for 15 minutes · estimated costs
                come from WakaTime · no source code or prompt text is requested
              </p>
            </StatsPanel>
          </div>
        </>
      )}
    </main>
  )
}
