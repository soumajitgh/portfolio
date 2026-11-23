import { afterEach, describe, expect, it, vi } from 'vitest'

import { getWakaTimeStats } from '@/lib/stats-data'

describe('getWakaTimeStats', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
  })

  it('returns unavailable stats without logging when WAKATIME_API_KEY is missing', async () => {
    vi.stubEnv('WAKATIME_API_KEY', '')
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const stats = await getWakaTimeStats()

    expect(stats.available).toBe(false)
    expect(stats.error).toBe('WAKATIME_API_KEY is not configured')
    expect(error).not.toHaveBeenCalled()
  })
})
