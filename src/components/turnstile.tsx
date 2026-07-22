'use client'

import Script from 'next/script'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { TurnstileAction } from '@/lib/turnstile'
import { cn } from '@/lib/utils'

type TurnstileOptions = {
  action: TurnstileAction
  appearance: 'interaction-only'
  callback: (token: string) => void
  'error-callback': () => void
  'expired-callback': () => void
  'response-field': false
  sitekey: string
  size: 'flexible'
  theme: 'dark'
  'timeout-callback': () => void
}

type TurnstileAPI = {
  remove: (widgetID: string) => void
  render: (container: HTMLElement, options: TurnstileOptions) => string
  reset: (widgetID: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileAPI
  }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export function Turnstile({
  action,
  className,
  onTokenChange,
  resetKey = 0,
}: {
  action: TurnstileAction
  className?: string
  onTokenChange: (token: string) => void
  resetKey?: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<null | string>(null)
  const callbackRef = useRef(onTokenChange)
  const [error, setError] = useState('')

  useEffect(() => {
    callbackRef.current = onTokenChange
  }, [onTokenChange])

  const clearToken = useCallback((message = '') => {
    callbackRef.current('')
    setError(message)
  }, [])

  const renderWidget = useCallback(() => {
    if (!siteKey || !containerRef.current || !window.turnstile || widgetRef.current) return

    widgetRef.current = window.turnstile.render(containerRef.current, {
      action,
      appearance: 'interaction-only',
      callback: (token) => {
        setError('')
        callbackRef.current(token)
      },
      'error-callback': () => clearToken('verification unavailable — retry'),
      'expired-callback': () => clearToken('verification expired — retry'),
      'response-field': false,
      sitekey: siteKey,
      size: 'flexible',
      theme: 'dark',
      'timeout-callback': () => clearToken('verification timed out — retry'),
    })
  }, [action, clearToken])

  useEffect(() => {
    return () => {
      if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current)
      widgetRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!resetKey || !widgetRef.current || !window.turnstile) return
    window.turnstile.reset(widgetRef.current)
    clearToken()
  }, [clearToken, resetKey])

  if (!siteKey) {
    return (
      <p className={cn('font-mono text-xs text-terminal-red', className)}>
        error: bot protection is not configured
      </p>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <Script
        id="cloudflare-turnstile"
        onReady={renderWidget}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <div ref={containerRef} />
      <p aria-live="polite" className="mt-1 min-h-4 font-mono text-[11px] text-terminal-red">
        {error}
      </p>
    </div>
  )
}
