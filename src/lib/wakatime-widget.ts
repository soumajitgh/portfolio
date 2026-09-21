import type { WakaTimeStats } from '@/lib/stats-data'

const WIDTH = 1200
const HEIGHT = 164
const CELL_WIDTH = WIDTH / 5

const escapeXML = (value: string) =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '"': '&quot;',
      '&': '&amp;',
      "'": '&apos;',
      '<': '&lt;',
      '>': '&gt;',
    }

    return entities[character]
  })

const parseDuration = (value: string) => {
  const hours = Number(
    value.match(/([\d,.]+)\s*(?:h|hr|hrs|hour|hours)\b/i)?.[1]?.replace(/,/g, ''),
  )
  const minutes = Number(value.match(/([\d,.]+)\s*(?:m|min|mins|minute|minutes)\b/i)?.[1])

  if (!Number.isFinite(hours) && !Number.isFinite(minutes)) return undefined

  return (Number.isFinite(hours) ? hours : 0) * 3600 + (Number.isFinite(minutes) ? minutes : 0) * 60
}

export function formatWidgetDuration(
  seconds: number | undefined,
  fallback: string,
  hoursOnly = false,
) {
  const normalizedSeconds = seconds && seconds > 0 ? seconds : parseDuration(fallback)
  if (normalizedSeconds === undefined) return fallback || '—'

  const totalMinutes = Math.round(normalizedSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hoursOnly) return `${Math.round(normalizedSeconds / 3600).toLocaleString('en-US')}h`
  if (!hours) return `${minutes}m`
  if (!minutes) return `${hours.toLocaleString('en-US')}h`

  return `${hours.toLocaleString('en-US')}h ${minutes}m`
}

export function createWakaTimeWidget(stats: WakaTimeStats) {
  const language = stats.languages[0]
  const editor = stats.editors[0]
  const metrics = [
    {
      label: 'all-time coding',
      value: formatWidgetDuration(stats.totalAllTimeSeconds, stats.totalAllTime, true),
    },
    {
      label: 'last 7 days',
      value: formatWidgetDuration(stats.totalThisWeekSeconds, stats.totalThisWeek),
    },
    {
      label: 'daily average',
      value: formatWidgetDuration(stats.dailyAverageSeconds, stats.dailyAverage),
    },
    {
      label: language ? `top language · ${Math.round(language.percent)}%` : 'top language',
      value: language?.name || '—',
    },
    {
      label: editor ? `top editor · ${Math.round(editor.percent)}%` : 'top editor',
      value: editor?.name || '—',
    },
  ]

  const separators = metrics
    .slice(1)
    .map((_, index) => {
      const x = (index + 1) * CELL_WIDTH
      return `<path d="M${x} 1V163" stroke="#30363d"/>`
    })
    .join('')

  const content = metrics
    .map((metric, index) => {
      const x = index * CELL_WIDTH + CELL_WIDTH / 2
      return `<g text-anchor="middle">
        <text x="${x}" y="65" class="value">${escapeXML(metric.value)}</text>
        <text x="${x}" y="108" class="label">${escapeXML(metric.label)}</text>
      </g>`
    })
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title description">
  <title id="title">WakaTime coding statistics</title>
  <desc id="description">All-time coding, last seven days, daily average, top language, and top editor.</desc>
  <style>
    .value { fill: #f0f6fc; font: 700 27px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
    .label { fill: #8b949e; font: 400 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
  </style>
  <rect x="0.75" y="0.75" width="1198.5" height="162.5" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1.5"/>
  ${separators}
  ${content}
</svg>`
}
