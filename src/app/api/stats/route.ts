import { getGitHubStats, getLeetCodeStats, getWakaTimeStats } from '@/lib/stats-data'

export const revalidate = 900

export async function GET() {
  const [leetcode, github, wakatime] = await Promise.all([
    getLeetCodeStats(),
    getGitHubStats(),
    getWakaTimeStats(),
  ])

  return Response.json(
    { github, leetcode, wakatime },
    { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800' } },
  )
}
