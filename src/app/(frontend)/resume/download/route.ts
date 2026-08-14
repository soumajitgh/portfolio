import { getPayload } from 'payload'

import type { Media } from '@/payload-types'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

function safeFilename(filename: null | string | undefined) {
  const value = filename?.replace(/[^a-zA-Z0-9._-]/g, '-') || 'soumajit-ghosh-resume.pdf'
  return value.toLowerCase().endsWith('.pdf') ? value : `${value}.pdf`
}

export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({
    slug: 'portfolio-settings',
    depth: 1,
    overrideAccess: false,
    select: { resumeFile: true },
  })
  const resume =
    settings.resumeFile && typeof settings.resumeFile === 'object'
      ? (settings.resumeFile as Media)
      : null

  if (!resume?.url) {
    return new Response('error: resume is not configured', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      status: 404,
    })
  }

  const fileURL = new URL(resume.url, request.url)
  const file = await fetch(fileURL, { cache: 'no-store' })
  if (!file.ok || !file.body) {
    return new Response('error: resume is temporarily unavailable', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      status: 502,
    })
  }

  return new Response(file.body, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': `attachment; filename="${safeFilename(resume.filename)}"`,
      'Content-Type': resume.mimeType || 'application/pdf',
    },
  })
}
