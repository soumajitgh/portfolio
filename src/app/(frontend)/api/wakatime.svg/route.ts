import { getWakaTimeStats } from '@/lib/stats-data'
import { createWakaTimeWidget } from '@/lib/wakatime-widget'

const SIX_HOURS = 60 * 60 * 6

export const revalidate = 21600

export async function GET() {
  const stats = await getWakaTimeStats()

  return new Response(createWakaTimeWidget(stats), {
    headers: {
      'Cache-Control': `public, max-age=0, s-maxage=${SIX_HOURS}, stale-while-revalidate=${SIX_HOURS}`,
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
