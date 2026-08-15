import posthog from 'posthog-js'

const projectToken =
  process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || 'phc_CaLtPZDA7oPnyivEYP4XpXB8qUXx5wfsmeZvgzdVgtdY'
const isPayloadAdmin = window.location.pathname.startsWith('/admin')

if (projectToken && !isPayloadAdmin) {
  posthog.init(projectToken, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://t.soumajit.dev',
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
    ui_host: 'https://eu.posthog.com',
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
