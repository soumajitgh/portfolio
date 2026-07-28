'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { captureEvent } from '@/lib/analytics'

const scrollMilestones = [25, 50, 75, 90] as const

function pageContext(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const [section, slug] = segments

  if (!section) return { page_type: 'home' }
  if (section === 'blogs' && slug) return { content_slug: slug, page_type: 'blog_post' }
  if (section === 'projects' && slug) return { content_slug: slug, page_type: 'project_detail' }

  return { page_type: section.replaceAll('-', '_') }
}

function linkLabel(link: HTMLAnchorElement) {
  return (link.getAttribute('aria-label') || link.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80)
}

export function SiteAnalytics() {
  const pathname = usePathname()

  useEffect(() => {
    const context = pageContext(pathname)
    const startedAt = performance.now()
    const reached = new Set<number>()
    let maxScrollDepth = 0
    let engaged = false
    let completed = false

    const completeView = () => {
      if (completed) return
      completed = true

      const durationSeconds = Math.round((performance.now() - startedAt) / 1000)
      if (durationSeconds < 5) return

      captureEvent('content_view_completed', {
        ...context,
        duration_seconds: durationSeconds,
        engaged,
        max_scroll_depth_percent: maxScrollDepth,
      })
    }

    const measureScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      const depth = scrollable <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / scrollable) * 100))
      maxScrollDepth = Math.max(maxScrollDepth, depth)

      for (const milestone of scrollMilestones) {
        if (depth < milestone || reached.has(milestone)) continue
        reached.add(milestone)
        captureEvent('content_scroll_depth_reached', {
          ...context,
          depth_percent: milestone,
        })
      }
    }

    const engagementTimer = window.setTimeout(() => {
      engaged = true
      captureEvent('content_engaged', {
        ...context,
        engagement_seconds: 10,
      })
    }, 10_000)

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null
      const link = target?.closest<HTMLAnchorElement>('a[href]')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href) return

      const label = linkLabel(link)
      if (href.startsWith('mailto:')) {
        captureEvent('contact_link_clicked', { ...context, contact_method: 'email', link_label: label })
        return
      }
      if (href.startsWith('tel:')) {
        captureEvent('contact_link_clicked', { ...context, contact_method: 'phone', link_label: label })
        return
      }
      if (href.startsWith('#')) {
        captureEvent('in_page_navigation_clicked', {
          ...context,
          destination_anchor: href.slice(1),
          link_label: label,
        })
        return
      }

      const destination = new URL(href, window.location.href)
      if (destination.pathname === '/resume') {
        captureEvent('resume_download_requested', { ...context, link_label: label })
      } else if (destination.origin !== window.location.origin) {
        captureEvent('external_link_clicked', {
          ...context,
          destination_host: destination.hostname,
          destination_path: destination.pathname,
          link_label: label,
        })
      } else if (/^\/(blogs|projects)\/[^/]+/.test(destination.pathname)) {
        captureEvent('content_selected', {
          ...context,
          destination_path: destination.pathname,
          destination_type: destination.pathname.startsWith('/blogs/') ? 'blog_post' : 'project',
          link_label: label,
        })
      }
    }

    measureScroll()
    window.addEventListener('scroll', measureScroll, { passive: true })
    window.addEventListener('pagehide', completeView)
    document.addEventListener('click', onClick)

    return () => {
      window.clearTimeout(engagementTimer)
      window.removeEventListener('scroll', measureScroll)
      window.removeEventListener('pagehide', completeView)
      document.removeEventListener('click', onClick)
      completeView()
    }
  }, [pathname])

  return null
}
