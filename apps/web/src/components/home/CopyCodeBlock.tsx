'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'

type CopyCodeBlockProps = {
  code: string
}

export function CopyCodeBlock({ code }: CopyCodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="relative w-full max-w-5xl rounded-[var(--n-radius-xl)] border border-[var(--border)] bg-[var(--card)] p-5 text-left">
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-1.5 rounded-[var(--n-radius-sm)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
        aria-label={copied ? 'Copied' : 'Copy code'}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
      <pre className="text-sm text-[var(--muted-foreground)] overflow-x-auto pr-8">
        <code>{code}</code>
      </pre>
    </div>
  )
}
