import { createHmac } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@/payload.config'
import { verifyTurnstileToken } from '@/lib/turnstile'

const rateWindow = 60 * 60 * 1000
const rateLimit = 5
const rateStore = new Map<string, { count: number; expiresAt: number }>()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin) return false
  try {
    const requestHost = request.headers.get('x-forwarded-host') || request.headers.get('host')
    return Boolean(requestHost) && new URL(origin).host === requestHost
  } catch {
    return false
  }
}

function rateKey(request: NextRequest) {
  const source = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  return createHmac('sha256', process.env.PAYLOAD_SECRET || 'contact-rate-limit')
    .update(source)
    .digest('hex')
}

function withinRateLimit(key: string) {
  const now = Date.now()
  const entry = rateStore.get(key)
  if (!entry || entry.expiresAt <= now) {
    rateStore.set(key, { count: 1, expiresAt: now + rateWindow })
    return true
  }
  if (entry.count >= rateLimit) return false
  entry.count += 1
  return true
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return error('Cross-origin request rejected', 403)
  if (!withinRateLimit(rateKey(request))) return error('Too many messages. Try again later.', 429)

  const declaredLength = Number(request.headers.get('content-length') || 0)
  if (declaredLength > 10_000) return error('Message is too large', 413)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const company = clean(body.company)
    const email = clean(body.email).toLowerCase()
    const message = clean(body.message)
    const name = clean(body.name)

    if (company) return NextResponse.json({ message: 'Message delivered.' })
    if (!name || name.length > 80) return error('Enter a valid name', 400)
    if (!emailPattern.test(email) || email.length > 160) return error('Enter a valid email', 400)
    if (message.length < 10 || message.length > 4000) {
      return error('Message must be between 10 and 4000 characters', 400)
    }
    const turnstile = await verifyTurnstileToken(body.turnstileToken, 'contact')
    if (!turnstile.configured) return error('Bot protection is not configured', 503)
    if (!turnstile.valid) return error('Bot verification failed. Please retry.', 403)
    if (!process.env.RESEND_API_KEY) return error('Mail delivery is not configured', 503)

    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'portfolio-settings',
      depth: 0,
      overrideAccess: false,
      select: { contact: true },
    })
    const recipient = process.env.CONTACT_TO_EMAIL || settings.contact?.email
    if (!recipient) return error('Mail recipient is not configured', 503)

    await payload.sendEmail({
      replyTo: email,
      subject: `Portfolio contact from ${name.replace(/[\r\n]/g, ' ')}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      to: recipient,
    })

    return NextResponse.json({ message: 'Message delivered. I will reply soon.' })
  } catch {
    return error('Unable to send message. Please retry or use direct email.', 500)
  }
}
