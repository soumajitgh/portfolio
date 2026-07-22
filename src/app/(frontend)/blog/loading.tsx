import { SiteHeader } from '@/components/site-header'

export default function BlogLoading() {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <main aria-busy="true" className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10 md:py-16">
        <p className="font-mono text-sm text-terminal-green">$ loading ./blog</p>
        <div className="mt-8 animate-pulse overflow-hidden rounded-lg border border-border">
          <div className="h-20 border-b border-border bg-card" />
          {Array.from({ length: 4 }, (_, index) => (
            <div className="h-32 border-b border-border bg-muted/40 last:border-0" key={index} />
          ))}
        </div>
      </main>
    </div>
  )
}
