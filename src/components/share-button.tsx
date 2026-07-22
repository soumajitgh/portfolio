'use client'

import { Check, CircleAlert, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'

type ShareState = 'copied' | 'error' | 'idle' | 'shared'

async function copyURL(url: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(url)
    return
  }

  const input = document.createElement('textarea')
  input.value = url
  input.setAttribute('readonly', '')
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()

  try {
    if (!document.execCommand('copy')) throw new Error('Unable to copy URL')
  } finally {
    input.remove()
  }
}

export function ShareButton({ text, title }: { text?: string; title: string }) {
  const [state, setState] = useState<ShareState>('idle')

  useEffect(() => {
    if (state === 'idle') return
    const timeout = window.setTimeout(() => setState('idle'), 2200)
    return () => window.clearTimeout(timeout)
  }, [state])

  const share = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ text, title, url })
        setState('shared')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await copyURL(url)
      setState('copied')
    } catch {
      setState('error')
    }
  }

  const label =
    state === 'copied'
      ? './copied'
      : state === 'shared'
        ? './shared'
        : state === 'error'
          ? './retry-share'
          : './share'

  return (
    <Button
      aria-label={
        state === 'error' ? 'Sharing failed; try sharing this project again' : 'Share this project'
      }
      onClick={share}
      size="sm"
      variant="outline"
    >
      {state === 'error' ? (
        <CircleAlert aria-hidden="true" className="text-terminal-red" />
      ) : state === 'copied' || state === 'shared' ? (
        <Check aria-hidden="true" className="text-terminal-green" />
      ) : (
        <Share2 aria-hidden="true" />
      )}
      {label}
    </Button>
  )
}
