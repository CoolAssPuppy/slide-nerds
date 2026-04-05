'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

type EmbedCodeDialogProps = {
  deckSlug: string
  deckName: string
  onClose: () => void
}

export function EmbedCodeDialog({ deckSlug, deckName, onClose }: EmbedCodeDialogProps) {
  const [copied, setCopied] = useState(false)

  const embedUrl = `https://slidenerds.com/d/${deckSlug}`
  const iframeCode = `<iframe src="${embedUrl}" width="960" height="540" frameborder="0" allowfullscreen title="${deckName}"></iframe>`
  const oembedUrl = `https://slidenerds.com/api/oembed?url=${encodeURIComponent(embedUrl)}`

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-[var(--n-radius-xl)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Embed {deckName}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">iframe embed code</label>
            <div className="relative">
              <pre className="text-xs text-[var(--muted-foreground)] bg-[#0a0a0a] border border-[var(--border)] rounded-[var(--n-radius-md)] p-3 overflow-x-auto">
                {iframeCode}
              </pre>
              <button
                onClick={() => handleCopy(iframeCode)}
                className="absolute top-2 right-2 p-1.5 rounded-[var(--n-radius-sm)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">oEmbed URL</label>
            <div className="flex items-center gap-2 p-3 rounded-[var(--n-radius-md)] bg-[var(--muted)]">
              <span className="text-xs text-[var(--muted-foreground)] truncate flex-1 font-mono">
                {oembedUrl}
              </span>
              <button
                onClick={() => handleCopy(oembedUrl)}
                className="text-xs text-[var(--primary)] hover:underline shrink-0"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Use this in platforms that support oEmbed for rich previews.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-[var(--n-radius-md)] text-sm hover:bg-[var(--accent)]">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
