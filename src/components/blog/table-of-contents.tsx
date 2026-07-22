import type { RichTextHeading } from '@/lib/rich-text-headings'

export function TableOfContents({ headings }: { headings: RichTextHeading[] }) {
  if (headings.length < 3) return null

  return (
    <details className="mt-8 rounded-lg border border-border bg-card/40 px-4 py-3 font-mono open:pb-4 sm:px-5">
      <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-terminal-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        ./contents <span className="ml-2 text-xs text-muted-foreground">({headings.length})</span>
      </summary>
      <nav aria-label="Article table of contents" className="mt-2 border-t border-border pt-3">
        <ol className="grid gap-1">
          {headings.map((heading, index) => (
            <li className={heading.depth === 3 ? 'pl-4' : undefined} key={`${heading.id}-${index}`}>
              <a
                className="flex min-h-11 items-center rounded px-2 text-xs leading-5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={`#${heading.id}`}
              >
                <span className="mr-2 text-terminal-blue">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {heading.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  )
}
