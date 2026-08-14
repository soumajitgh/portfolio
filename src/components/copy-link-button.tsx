'use client'

import { Check, Link2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { captureEvent } from '@/lib/analytics'

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      captureEvent('content_link_copied', { content_type: 'blog_post' })
    } catch {
      setCopied(false)
      captureEvent('content_link_copy_failed', { content_type: 'blog_post' })
    }
  }

  return (
    <Button aria-label="Copy link to this article" onClick={copy} size="sm" variant="outline">
      {copied ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
      {copied ? './copied' : './copy-link'}
    </Button>
  )
}
