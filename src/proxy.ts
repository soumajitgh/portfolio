import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import payloadConfig from '@/payload.config'

const maintenancePage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Under maintenance | soumajit.dev</title>
    <link rel="icon" href="/icon.svg" type="image/svg+xml">
    <style>
      :root { color-scheme: light; }
      body {
        box-sizing: border-box;
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 2rem;
        background: #f7f6f2;
        color: #20201e;
        font-family: system-ui, sans-serif;
      }
      main { max-width: 34rem; border-top: 3px solid #8c4b32; padding-top: 2rem; }
      h1 { margin: .5rem 0; font-size: clamp(2rem, 8vw, 4rem); line-height: 1.05; }
      p { margin: 0; line-height: 1.6; }
      .site { color: #8c4b32; font-family: ui-monospace, monospace; }
    </style>
  </head>
  <body>
    <main>
      <p class="site">soumajit.dev</p>
      <h1>Under maintenance</h1>
      <p>The site is temporarily unavailable while updates are underway. Please check back soon.</p>
    </main>
  </body>
</html>`

export async function proxy(request: NextRequest) {
  const payload = await getPayload({ config: payloadConfig })
  const maintenance = await payload.findGlobal({
    slug: 'maintenance-settings',
    depth: 0,
    overrideAccess: true,
    select: { enabled: true },
  })

  if (maintenance.enabled !== true) return NextResponse.next()

  return new Response(request.method === 'HEAD' ? null : maintenancePage, {
    status: 503,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '300',
    },
  })
}

export const config = {
  matcher: [
    // Payload owns the remaining /api routes, including the admin panel's REST and GraphQL calls.
    '/((?!admin(?:/|$)|api(?:/|$)|_next(?:/|$)|icon\\.svg$).*)',
    '/api/contact',
    '/api/projects/:slug/star',
    '/api/stats',
    '/api/wakatime.svg',
  ],
}
