const WORDS_PER_MINUTE = 220

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const collectText = (value: unknown, output: string[]) => {
  if (typeof value === 'string') {
    output.push(value)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectText(item, output))
    return
  }

  if (!isRecord(value)) return

  if (typeof value.text === 'string') {
    output.push(value.text)
    return
  }

  if (
    value.blockType === 'code' &&
    isRecord(value.fields) &&
    typeof value.fields.code === 'string'
  ) {
    output.push(value.fields.code)
    return
  }

  if (value.type === 'upload') {
    const upload = isRecord(value.value) ? value.value : undefined
    const fields = isRecord(value.fields) ? value.fields : undefined
    const caption = fields?.caption ?? upload?.caption
    const alt = fields?.alt ?? upload?.alt

    if (typeof caption === 'string') output.push(caption)
    else if (typeof alt === 'string') output.push(alt)
    return
  }

  if (value.root) collectText(value.root, output)
  if (value.children) collectText(value.children, output)
  if (value.fields && value.blockType !== 'code') collectText(value.fields, output)
}

export const lexicalToPlainText = (value: unknown) => {
  const output: string[] = []
  collectText(value, output)
  return output.join(' ').replace(/\s+/g, ' ').trim()
}

export const createExcerpt = (text: string, maximumLength = 220) => {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maximumLength) return normalized

  const shortened = normalized.slice(0, maximumLength + 1)
  const lastSpace = shortened.lastIndexOf(' ')
  return `${shortened.slice(0, lastSpace > maximumLength * 0.7 ? lastSpace : maximumLength).trim()}…`
}

export const calculateReadingMinutes = (text: string) => {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

export const normalizeBlogLabel = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const normalizeBlogSlug = (value: string) => normalizeBlogLabel(value)

export const formatBlogDate = (value?: null | string) => {
  if (!value) return 'unpublished'
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export const wasMeaningfullyUpdated = (publishedAt?: null | string, updatedAt?: null | string) => {
  if (!publishedAt || !updatedAt) return false
  return new Date(updatedAt).getTime() - new Date(publishedAt).getTime() > 24 * 60 * 60 * 1000
}
