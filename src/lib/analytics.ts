'use client'

import posthog from 'posthog-js'

type AnalyticsProperty = boolean | null | number | string | string[] | undefined

export type AnalyticsProperties = Record<string, AnalyticsProperty>

export function captureEvent(event: string, properties: AnalyticsProperties = {}) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return

  posthog.capture(event, properties)
}
