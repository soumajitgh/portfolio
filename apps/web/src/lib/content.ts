export const projectCategories = [
  { label: 'Infrastructure', value: 'infrastructure' },
  { label: 'Developer tools', value: 'developer-tools' },
  { label: 'Application', value: 'application' },
  { label: 'Open source', value: 'open-source' },
  { label: 'Experiment', value: 'experiment' },
  { label: 'Other', value: 'other' },
] as const

export const projectStatuses = [
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Maintained', value: 'maintained' },
  { label: 'Archived', value: 'archived' },
  { label: 'Experimental', value: 'experimental' },
] as const

export const accentOptions = [
  { label: 'Blue', value: 'blue' },
  { label: 'Cyan', value: 'cyan' },
  { label: 'Green', value: 'green' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Purple', value: 'purple' },
] as const

export const skillCategories = [
  { label: 'Languages', value: 'languages' },
  { label: 'Backend and APIs', value: 'backend-apis' },
  { label: 'Data and storage', value: 'data-storage' },
  { label: 'Infrastructure', value: 'infrastructure' },
  { label: 'Observability', value: 'observability' },
  { label: 'Tools', value: 'tools' },
] as const

export function slugify(value: string) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatLabel(value: string) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (character) => character.toUpperCase())
}

export function validateWebURL(value: null | string | undefined) {
  if (!value) return true
  if (value.startsWith('/') || value.startsWith('#')) return true

  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) || 'Use an http(s) URL or an internal path.'
  } catch {
    return 'Enter a valid URL.'
  }
}
