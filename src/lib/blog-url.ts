export function blogHref({
  label,
  page,
  query,
}: {
  label?: string
  page?: number
  query?: string
}) {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  if (label) params.set('label', label)
  if (page && page > 1) params.set('page', String(page))
  return params.size ? `/blog?${params.toString()}` : '/blog'
}
