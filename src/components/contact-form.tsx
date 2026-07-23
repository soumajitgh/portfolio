'use client'

import { Send } from 'lucide-react'
import { FormEvent, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Turnstile } from '@/components/turnstile'
import { captureEvent } from '@/lib/analytics'

type FormState = 'error' | 'idle' | 'sending' | 'sent'

export function ContactForm() {
  const [state, setState] = useState<FormState>('idle')
  const [message, setMessage] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileResetKey, setTurnstileResetKey] = useState(0)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'sending') return

    const form = event.currentTarget
    const data = new FormData(form)
    if (!turnstileToken) {
      setState('error')
      setMessage('Complete the bot verification before sending.')
      return
    }
    setState('sending')
    setMessage('')
    captureEvent('contact_form_submitted')

    try {
      const response = await fetch('/api/contact', {
        body: JSON.stringify({
          company: data.get('company'),
          email: data.get('email'),
          message: data.get('message'),
          name: data.get('name'),
          turnstileToken,
        }),
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = (await response.json()) as { error?: string; message?: string }
      if (!response.ok) throw new Error(result.error || 'Unable to send message')

      form.reset()
      setState('sent')
      setMessage(result.message || 'Message delivered. I will reply soon.')
      captureEvent('contact_form_succeeded')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Unable to send message')
      captureEvent('contact_form_failed', {
        failure_type: error instanceof TypeError ? 'network' : 'response',
      })
    } finally {
      setTurnstileToken('')
      setTurnstileResetKey((value) => value + 1)
    }
  }

  const fieldClassName =
    'mt-1.5 min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:text-sm'

  return (
    <form className="space-y-4" data-ph-no-capture="true" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block font-mono text-[0.6875rem] text-terminal-cyan sm:text-xs">
          name
          <input
            autoComplete="name"
            className={fieldClassName}
            maxLength={80}
            name="name"
            placeholder="your name"
            required
          />
        </label>
        <label className="block font-mono text-[0.6875rem] text-terminal-cyan sm:text-xs">
          email
          <input
            autoComplete="email"
            className={fieldClassName}
            maxLength={160}
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </label>
      </div>
      <label className="block font-mono text-[0.6875rem] text-terminal-cyan sm:text-xs">
        message
        <textarea
          className={`${fieldClassName} min-h-32 resize-y leading-6`}
          maxLength={4000}
          name="message"
          placeholder="project context, constraints, and what you need help with"
          required
        />
      </label>
      <label aria-hidden="true" className="hidden">
        Company
        <input autoComplete="off" name="company" tabIndex={-1} />
      </label>
      <Turnstile
        action="contact"
        className="max-w-sm"
        onTokenChange={setTurnstileToken}
        resetKey={turnstileResetKey}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={state === 'sending'} type="submit">
          <Send aria-hidden="true" />
          {state === 'sending' ? './sending...' : './send-message'}
        </Button>
        <p
          aria-live="polite"
          className={`font-mono text-[0.6875rem] sm:text-xs ${state === 'error' ? 'text-terminal-red' : 'text-terminal-green'}`}
        >
          {message}
        </p>
      </div>
    </form>
  )
}
