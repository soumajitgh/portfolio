import { describe, expect, it } from 'vitest'

import type { WakaTimeStats } from '@/lib/stats-data'
import { createWakaTimeWidget, formatWidgetDuration } from '@/lib/wakatime-widget'

const stats: WakaTimeStats = {
  ai: {
    additions: 0,
    adoptionPercent: 0,
    averagePromptCharacters: 0,
    aiCodingTime: '—',
    available: false,
    daily: [],
    deletions: 0,
    humanLineChanges: 0,
    inputTokens: 0,
    lineChanges: 0,
    medianPromptsPerSession: 0,
    models: [],
    outputTokens: 0,
    projects: [],
    promptCharacters: 0,
    promptEvents: 0,
    promptsPerSession: 0,
    sessions: 0,
    totalCost: 0,
  },
  available: true,
  daily: [],
  dailyAverage: '4 hrs 19 mins',
  dailyAverageSeconds: 15_540,
  editors: [{ name: 'Claude & Code', percent: 46.2, seconds: 0, text: '' }],
  languages: [{ name: 'TypeScript <TS>', percent: 62.7, seconds: 0, text: '' }],
  operatingSystems: [],
  projects: [],
  range: 'Last 7 days',
  totalAllTime: '1,510 hrs',
  totalAllTimeSeconds: 5_436_000,
  totalThisWeek: '30 hrs 16 mins',
  totalThisWeekSeconds: 108_960,
}

describe('formatWidgetDuration', () => {
  it('formats long and short durations for the compact widget', () => {
    expect(formatWidgetDuration(5_436_000, '', true)).toBe('1,510h')
    expect(formatWidgetDuration(108_960, '')).toBe('30h 16m')
    expect(formatWidgetDuration(undefined, '4 hrs 19 mins')).toBe('4h 19m')
  })
})

describe('createWakaTimeWidget', () => {
  it('renders all five metrics and escapes API-provided values', () => {
    const svg = createWakaTimeWidget(stats)

    expect(svg).toContain('all-time coding')
    expect(svg).toContain('last 7 days')
    expect(svg).toContain('daily average')
    expect(svg).toContain('TypeScript &lt;TS&gt;')
    expect(svg).toContain('Claude &amp; Code')
    expect(svg).toContain('top language · 63%')
    expect(svg).toContain('top editor · 46%')
    expect(svg.match(/class="value"/g)).toHaveLength(5)
  })
})
