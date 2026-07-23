'use client'

import { Check, ChevronDown } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'

import type { FilterOption } from '@/components/filter-select'
import { captureEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'

export function MultiFilterDropdown({
  accessibleLabel,
  allLabel,
  name,
  options,
  values,
}: {
  accessibleLabel: string
  allLabel: string
  name: string
  options: FilterOption[]
  values: string[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState(values)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  const selectedLabels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label)
  const summary =
    selectedLabels.length === 0
      ? allLabel
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${selectedLabels.length} technologies selected`

  const updateSelection = (nextValues: string[]) => {
    setSelected(nextValues)
    captureEvent('content_filter_changed', {
      filter_name: name,
      filter_value: nextValues,
      page_type: pathname.replace('/', '') || 'home',
      selected_count: nextValues.length,
    })

    const params = new URLSearchParams(searchParams.toString())
    params.delete(name)
    for (const value of nextValues) params.append(name, value)
    params.delete('page')

    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname
    startTransition(() => router.replace(next, { scroll: false }))
  }

  return (
    <div className="relative min-w-0" ref={containerRef}>
      <button
        aria-busy={isPending}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="terminal-input flex h-10 w-full items-center justify-between gap-3 rounded-md border border-input bg-card px-3 font-mono text-sm text-foreground outline-none transition-colors hover:border-ring focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 sm:h-11"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="truncate">{summary}</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen ? (
        <div
          aria-label={accessibleLabel}
          className="absolute right-0 z-30 mt-2 w-full min-w-64 overflow-hidden rounded-md border border-border bg-popover shadow-xl"
          role="listbox"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="font-mono text-xs text-muted-foreground">
              {selected.length ? `${selected.length} selected` : allLabel}
            </span>
            {selected.length ? (
              <button
                className="font-mono text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => updateSelection([])}
                type="button"
              >
                clear
              </button>
            ) : null}
          </div>
          <div className="max-h-72 overflow-y-auto p-1.5">
            {options.map((option) => {
              const isSelected = selected.includes(option.value)

              return (
                <label
                  className={cn(
                    'flex min-h-10 cursor-pointer items-center gap-3 rounded px-2.5 py-2 font-mono text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
                    isSelected && 'bg-accent/60 text-foreground',
                  )}
                  key={option.value}
                >
                  <input
                    checked={isSelected}
                    className="sr-only"
                    onChange={() =>
                      updateSelection(
                        isSelected
                          ? selected.filter((value) => value !== option.value)
                          : [...selected, option.value],
                      )
                    }
                    type="checkbox"
                    value={option.value}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      'grid size-4 shrink-0 place-items-center rounded border border-input',
                      isSelected && 'border-primary bg-primary text-primary-foreground',
                    )}
                  >
                    {isSelected ? <Check className="size-3" strokeWidth={3} /> : null}
                  </span>
                  <span className="truncate">{option.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
