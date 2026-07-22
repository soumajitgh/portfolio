export default function ProjectsLoading() {
  return (
    <div className="min-h-[calc(100dvh-4rem)]">
      <main aria-busy="true" className="page-container animate-pulse py-12 md:py-16">
        <div className="h-4 w-64 rounded bg-muted" />
        <div className="mt-5 h-12 w-80 max-w-full rounded bg-muted" />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div className="h-72 rounded-lg border border-border bg-card" key={item} />
          ))}
        </div>
      </main>
    </div>
  )
}
