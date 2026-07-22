import { SearchField } from '@/components/search-field'

export function ProjectSearch({ initialQuery }: { initialQuery: string }) {
  return (
    <SearchField
      accessibleLabel="Search published projects"
      initialQuery={initialQuery}
      placeholder="search projects…"
    />
  )
}
