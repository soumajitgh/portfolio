'use client'

import { ChevronDown } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

import { captureEvent } from '@/lib/analytics'

export type FilterOption = {
  label: string
  value: string
}

export function FilterSelect({
  accessibleLabel,
  allLabel,
  name,
  options,
  value,
}: {
  accessibleLabel: string
  allLabel: string
  name: string
  options: FilterOption[]
  value: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  return (
    <label className="relative block w-full sm:max-w-xs">
      <span className="sr-only">{accessibleLabel}</span>
      <select
        aria-busy={isPending}
        className="terminal-input h-10 w-full appearance-none rounded-md border border-input bg-card px-3 pr-10 font-mono text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 sm:h-11"
        name={name}
        onChange={(event) => {
          captureEvent('content_filter_changed', {
            filter_name: name,
            filter_value: event.target.value || 'all',
            page_type: pathname.replace('/', '') || 'home',
          })
          const params = new URLSearchParams(searchParams.toString())
          if (event.target.value) params.set(name, event.target.value)
          else params.delete(name)
          params.delete('page')

          const next = params.toString() ? `${pathname}?${params.toString()}` : pathname
          startTransition(() => router.replace(next, { scroll: false }))
        }}
        value={value}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </label>
  )
}
