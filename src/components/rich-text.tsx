import {
  type JSXConverterArgs,
  type JSXConvertersFunction,
  RichText,
} from '@payloadcms/richtext-lexical/react'
import Prism from 'prismjs'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import React from 'react'

import type { Project } from '@/payload-types'
import { slugify } from '@/lib/content'

function nodeText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  if ('text' in node && typeof node.text === 'string') return node.text
  if ('children' in node && Array.isArray(node.children))
    return node.children.map(nodeText).join('')
  return ''
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const Tag = node.tag as 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    const label = nodeText(node) || 'section'
    const id = slugify(label)
    return (
      <Tag id={id}>
        <a aria-label={`Link to ${label}`} className="no-underline" href={`#${id}`}>
          {nodesToJSX({ nodes: node.children })}
        </a>
      </Tag>
    )
  },
  link: ({ node, nodesToJSX }) => {
    const href = node.fields.url || '#'
    const external = /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        rel={external ? 'noopener noreferrer' : undefined}
        target={external ? '_blank' : undefined}
      >
        {nodesToJSX({ nodes: node.children })}
      </a>
    )
  },
  blocks: {
    Code: ({ node }: JSXConverterArgs) => {
      const fields =
        (node as unknown as { fields?: { code?: string; language?: string } }).fields || {}
      const language = fields.language?.toLowerCase() || 'text'
      const grammar = Prism.languages[language] || Prism.languages.plain
      const highlighted = Prism.highlight(fields.code || '', grammar, language)
      return (
        <pre data-language={language}>
          <code
            className={`language-${language}`}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      )
    },
  },
})

export function ProjectOverview({ data }: { data: Project['overview'] }) {
  return <RichText className="readme" converters={converters} data={data} />
}
