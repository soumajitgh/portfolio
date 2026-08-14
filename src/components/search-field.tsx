'use client'

import { Search, X } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

import { captureEvent } from '@/lib/analytics'

export function SearchField({
  accessibleLabel,
  initialQuery,
  placeholder,
}: {
  accessibleLabel: string
  initialQuery: string
  placeholder: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)
  const userEdited = useRef(false)
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditing =
        target?.matches('input, textarea, select') ||
        target?.getAttribute('contenteditable') === 'true'

      if (event.key === '/' && !isEditing) {
        event.preventDefault()
        inputRef.current?.focus()
      }

      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        if (query) setQuery('')
        else inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [query])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (query.trim()) params.set('q', query.trim())
      else params.delete('q')
      params.delete('page')

      const next = params.toString() ? `${pathname}?${params.toString()}` : pathname
      const current = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname
      if (next !== current) {
        if (userEdited.current) {
          captureEvent(query.trim() ? 'content_search_performed' : 'content_search_cleared', {
            content_type: pathname.includes('/blogs') ? 'blog_post' : 'project',
            query: query.trim().slice(0, 100) || undefined,
            query_length: query.trim().length,
          })
        }
        startTransition(() => router.replace(next, { scroll: false }))
      }
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [pathname, query, router, searchParams])

  return (
    <label className="relative block w-full">
      <span className="sr-only">{accessibleLabel}</span>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        aria-busy={isPending}
        className="terminal-input h-10 w-full rounded-md border border-input bg-card pl-9 pr-12 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 sm:h-11 sm:pl-10 sm:pr-20 sm:text-sm"
        onChange={(event) => {
          userEdited.current = true
          setQuery(event.target.value)
        }}
        placeholder={placeholder}
        ref={inputRef}
        type="search"
        value={query}
      />
      {query ? (
        <button
          aria-label="Clear search"
          className="absolute right-0 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:size-11"
          onClick={() => {
            userEdited.current = true
            setQuery('')
            inputRef.current?.focus()
          }}
          type="button"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      ) : null}
    </label>
  )
}
