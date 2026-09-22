import { getWakaTimeStats } from '@/lib/stats-data'
import { createWakaTimeWidget } from '@/lib/wakatime-widget'

const SIX_HOURS = 60 * 60 * 6

// This endpoint depends on a runtime-only secret. Without forcing dynamic
// rendering, Next.js prerenders an empty SVG while building the Docker image,
// where WAKATIME_API_KEY is deliberately unavailable.
export const dynamic = 'force-dynamic'

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
