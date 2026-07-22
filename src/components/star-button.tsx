'use client'

import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Turnstile } from '@/components/turnstile'
import { cn } from '@/lib/utils'

type StarState = { count: number; starred: boolean }

export function StarButton({ slug }: { slug: string }) {
  const [state, setState] = useState<StarState>({ count: 0, starred: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)

  useEffect(() => {
    let active = true
    fetch(`/api/projects/${slug}/star`, { credentials: 'same-origin' })
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
  }, [slug])

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
      const response = await fetch(`/api/projects/${slug}/star`, {
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
    <div className="flex flex-col items-end gap-1">
      <Button
        aria-label={`${state.starred ? 'Remove star from' : 'Star'} project. ${state.count} stars`}
        aria-pressed={state.starred}
        disabled={loading}
        onClick={toggle}
        variant="outline"
      >
        <Star
          className={cn(state.starred && 'fill-terminal-yellow text-terminal-yellow')}
          aria-hidden="true"
        />
        {loading ? '...' : state.starred ? './starred' : './star'}
        <span className="text-muted-foreground">{state.count}</span>
      </Button>
      <Turnstile
        action="star"
        className="max-w-[18rem]"
        onTokenChange={setTurnstileToken}
        resetKey={turnstileResetKey}
      />
      <span aria-live="polite" className="min-h-4 font-mono text-[11px] text-terminal-red">
        {error}
      </span>
    </div>
  )
}
