import { createHmac, randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

import { verifyTurnstileToken } from '@/lib/turnstile'
import config from '@/payload.config'

const visitorCookie = 'portfolio_visitor'
const rateWindow = 60_000
const rateLimit = 12

type RateEntry = { count: number; expiresAt: number }
const rateStore = new Map<string, RateEntry>()

function visitorIdentity(request: NextRequest) {
  const existing = request.cookies.get(visitorCookie)?.value
  const identifier = existing && /^[a-f0-9-]{20,80}$/i.test(existing) ? existing : randomUUID()
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET is required')
  const hash = createHmac('sha256', secret).update(identifier).digest('hex')
  return { hash, identifier, isNew: !existing }
}

function withVisitorCookie(response: NextResponse, identifier: string, isNew: boolean) {
  if (isNew) {
    response.cookies.set(visitorCookie, identifier, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }
  return response
}

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

async function getPublishedBlogPostID(slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'blog-posts',
    limit: 1,
    overrideAccess: false,
    select: { slug: true },
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })
  return result.docs[0]?.id || null
}

async function getState(blogPostID: number, visitorHash: string) {
  const payload = await getPayload({ config })
  const [visitorStars, count] = await Promise.all([
    payload.find({
      collection: 'blog-stars',
      limit: 1,
      overrideAccess: true,
      select: { blogPost: true },
      where: {
        and: [{ blogPost: { equals: blogPostID } }, { visitorHash: { equals: visitorHash } }],
      },
    }),
    payload.count({
      collection: 'blog-stars',
      overrideAccess: true,
      where: { blogPost: { equals: blogPostID } },
    }),
  ])
  return {
    count: count.totalDocs,
    starID: visitorStars.docs[0]?.id || null,
    starred: Boolean(visitorStars.docs[0]),
  }
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

async function verifyMutation(request: NextRequest) {
  try {
    const body = (await request.json()) as { turnstileToken?: unknown }
    return verifyTurnstileToken(body.turnstileToken, 'star')
  } catch {
    return { configured: Boolean(process.env.TURNSTILE_SECRET_KEY), valid: false }
  }
}

function revalidateBlogPost(slug: string) {
  revalidatePath('/blogs')
  revalidatePath(`/blogs/${slug}`)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const blogPostID = await getPublishedBlogPostID(slug)
    if (!blogPostID) return errorResponse('Blog post not found', 404)
    const visitor = visitorIdentity(request)
    const state = await getState(blogPostID, visitor.hash)
    return withVisitorCookie(
      NextResponse.json({ count: state.count, starred: state.starred }),
      visitor.identifier,
      visitor.isNew,
    )
  } catch {
    return errorResponse('Unable to read star state', 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!isSameOrigin(request)) return errorResponse('Cross-origin request rejected', 403)

  try {
    const turnstile = await verifyMutation(request)
    if (!turnstile.configured) return errorResponse('Bot protection is not configured', 503)
    if (!turnstile.valid) return errorResponse('Bot verification failed', 403)

    const { slug } = await params
    const blogPostID = await getPublishedBlogPostID(slug)
    if (!blogPostID) return errorResponse('Blog post not found', 404)
    const visitor = visitorIdentity(request)
    if (!withinRateLimit(`blog:${blogPostID}:${visitor.hash}`))
      return errorResponse('Too many requests', 429)

    const payload = await getPayload({ config })
    const state = await getState(blogPostID, visitor.hash)
    if (!state.starred) {
      try {
        await payload.create({
          collection: 'blog-stars',
          data: { blogPost: blogPostID, visitorHash: visitor.hash },
          overrideAccess: true,
        })
      } catch {
        // A concurrent idempotent request may win the unique-index race.
      }
    }
    const updated = await getState(blogPostID, visitor.hash)
    revalidateBlogPost(slug)
    return withVisitorCookie(
      NextResponse.json({ count: updated.count, starred: updated.starred }),
      visitor.identifier,
      visitor.isNew,
    )
  } catch {
    return errorResponse('Unable to add star', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isSameOrigin(request)) return errorResponse('Cross-origin request rejected', 403)

  try {
    const turnstile = await verifyMutation(request)
    if (!turnstile.configured) return errorResponse('Bot protection is not configured', 503)
    if (!turnstile.valid) return errorResponse('Bot verification failed', 403)

    const { slug } = await params
    const blogPostID = await getPublishedBlogPostID(slug)
    if (!blogPostID) return errorResponse('Blog post not found', 404)
    const visitor = visitorIdentity(request)
    if (!withinRateLimit(`blog:${blogPostID}:${visitor.hash}`))
      return errorResponse('Too many requests', 429)

    const payload = await getPayload({ config })
    const state = await getState(blogPostID, visitor.hash)
    if (state.starID) {
      await payload.delete({ collection: 'blog-stars', id: state.starID, overrideAccess: true })
    }
    const updated = await getState(blogPostID, visitor.hash)
    revalidateBlogPost(slug)
    return withVisitorCookie(
      NextResponse.json({ count: updated.count, starred: updated.starred }),
      visitor.identifier,
      visitor.isNew,
    )
  } catch {
    return errorResponse('Unable to remove star', 500)
  }
}
