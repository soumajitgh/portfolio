import { SearchField } from '@/components/search-field'

export function BlogSearch({ initialQuery }: { initialQuery: string }) {
  return (
    <SearchField
      accessibleLabel="Search published blog posts"
      initialQuery={initialQuery}
      placeholder="search issues…"
    />
  )
}
