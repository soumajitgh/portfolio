import { afterEach, describe, expect, it, vi } from 'vitest'

import { getWakaTimeStats } from '@/lib/stats-data'

describe('getWakaTimeStats', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('logs a clear configuration error when WAKATIME_API_KEY is missing', async () => {
    vi.stubEnv('WAKATIME_API_KEY', '')
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const stats = await getWakaTimeStats()

    expect(stats.available).toBe(false)
    expect(stats.error).toBe('WAKATIME_API_KEY is not configured')
    expect(error).toHaveBeenCalledOnce()
    expect(error).toHaveBeenCalledWith(
      '[WakaTime] Configuration error: WAKATIME_API_KEY is missing; coding stats are unavailable.',
    )
  })
})
