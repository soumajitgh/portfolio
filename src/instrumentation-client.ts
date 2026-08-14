import posthog from 'posthog-js'

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
const isPayloadAdmin = window.location.pathname.startsWith('/admin')

if (projectToken && !isPayloadAdmin) {
  posthog.init(projectToken, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    autocapture: true,
    capture_dead_clicks: true,
    capture_exceptions: true,
    capture_heatmaps: true,
    capture_pageleave: true,
    capture_pageview: 'history_change',
    capture_performance: true,
    defaults: '2026-05-30',
    disable_session_recording: false,
    mask_all_text: false,
    person_profiles: 'identified_only',
    respect_dnt: true,
    session_recording: {
      maskAllInputs: true,
      maskCapturedNetworkRequestFn: (request) => {
        if (request.name) request.name = request.name.split('?')[0]
        return request
      },
    },
  })
}
