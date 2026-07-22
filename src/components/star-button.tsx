'use client'

import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Turnstile } from '@/components/turnstile'
import { cn } from '@/lib/utils'

type StarState = { count: number; starred: boolean }
const turnstileConfigured = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

export function StarButton({
  resource = 'projects',
  slug,
}: {
  resource?: 'blog' | 'projects'
  slug: string
}) {
  const [state, setState] = useState<StarState>({ count: 0, starred: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)
  const endpoint = `/api/${resource}/${slug}/star`
  const subject = resource === 'blog' ? 'blog post' : 'project'

  useEffect(() => {
    let active = true
    fetch(endpoint, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load stars')
        return response.json() as Promise<StarState>
      })
      .then((data) => {
        if (!active) return
        setState(data)
        setError('')
      })
      .catch(() => {
        if (active) setError('star status unavailable')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [endpoint])

  async function toggle() {
    if (loading) return
    if (!turnstileToken) {
      setError('complete bot verification first')
      return
    }
    const previous = state
    const optimistic = {
      starred: !state.starred,
      count: Math.max(0, state.count + (state.starred ? -1 : 1)),
    }
    setState(optimistic)
    setLoading(true)
    setError('')

    try {
      const response = await fetch(endpoint, {
        body: JSON.stringify({ turnstileToken }),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: optimistic.starred ? 'PUT' : 'DELETE',
      })
      if (!response.ok) throw new Error('Unable to update star')
      setState((await response.json()) as StarState)
    } catch {
      setState(previous)
      setError('request failed — retry')
    } finally {
      setLoading(false)
      setTurnstileToken('')
      setTurnstileResetKey((value) => value + 1)
    }
  }

  return (
    <div className="relative inline-flex max-w-full flex-col items-end">
      <Button
        aria-label={`${state.starred ? 'Remove star from' : 'Star'} ${subject}. ${state.count} stars`}
        aria-pressed={state.starred}
        disabled={loading || !turnstileConfigured}
        onClick={toggle}
        title={turnstileConfigured ? undefined : 'Bot protection is not configured'}
        variant="outline"
      >
        <Star
          className={cn(state.starred && 'fill-terminal-yellow text-terminal-yellow')}
          aria-hidden="true"
        />
        {loading ? '...' : state.starred ? './starred' : './star'}
        <span className="text-muted-foreground">{state.count}</span>
      </Button>
      {turnstileConfigured || error ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] text-right max-sm:static">
          {turnstileConfigured ? (
            <Turnstile
              action="star"
              onTokenChange={setTurnstileToken}
              resetKey={turnstileResetKey}
            />
          ) : null}
          {error ? (
            <span
              aria-live="polite"
              className="block rounded border border-destructive/30 bg-background/95 px-2 py-1 font-mono text-[11px] text-terminal-red shadow-sm"
            >
              {error}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
