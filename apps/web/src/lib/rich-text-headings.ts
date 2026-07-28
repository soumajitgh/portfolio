import { slugify } from '@/lib/content'

export type RichTextHeading = {
  depth: 2 | 3
  id: string
  label: string
}

function textFromNode(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  if ('text' in node && typeof node.text === 'string') return node.text
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map(textFromNode).join('')
  }
  return ''
}

export function extractRichTextHeadings(data: unknown): RichTextHeading[] {
  const headings: RichTextHeading[] = []

  function visit(node: unknown) {
    if (!node || typeof node !== 'object') return

    if (
      'type' in node &&
      node.type === 'heading' &&
      'tag' in node &&
      (node.tag === 'h2' || node.tag === 'h3')
    ) {
      const label = textFromNode(node).trim()
      if (label) {
        headings.push({ depth: node.tag === 'h2' ? 2 : 3, id: slugify(label), label })
      }
    }

    if ('children' in node && Array.isArray(node.children)) node.children.forEach(visit)
    if ('root' in node) visit(node.root)
  }

  visit(data)
  return headings
}
