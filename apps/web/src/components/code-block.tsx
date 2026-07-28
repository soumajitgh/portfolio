'use client'

import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'

export function CodeBlockWithCopy({
  code,
  highlighted,
  language,
}: {
  code: string
  highlighted: string
  language: string
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <figure className="code-frame">
      <figcaption>
        <span>{language}</span>
        <button aria-label={`Copy ${language} code`} onClick={copy} type="button">
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? 'copied' : 'copy'}
        </button>
      </figcaption>
      <pre data-language={language}>
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </figure>
  )
}
