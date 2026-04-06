'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'

type ExportDropdownProps = {
  deckId: string
  isOpen: boolean
  onClose: () => void
}

export function ExportDropdown({ deckId, isOpen, onClose }: ExportDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleExport = async () => {
    setExporting(true)
    try {
      const resp = await fetch(`/api/decks/${deckId}/export/pdf`, {
        method: 'POST',
      })

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Export failed' }))
        alert(err.error)
        return
      }

      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = resp.headers.get('content-disposition')?.match(/filename="(.+)"/)?.[1] ?? 'deck.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      onClose()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 w-56 rounded-[var(--n-radius-md)] border border-[var(--border)] bg-[var(--popover)] shadow-lg py-1 z-50"
    >
      <button
        onClick={handleExport}
        disabled={exporting}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[var(--accent)] transition-colors disabled:opacity-60"
      >
        {exporting ? (
          <Loader2 className="w-4 h-4 text-[var(--muted-foreground)] animate-spin" />
        ) : (
          <FileText className="w-4 h-4 text-[var(--muted-foreground)]" />
        )}
        <div className="text-left">
          <p className="font-medium">Export as PDF</p>
          <p className="text-xs text-[var(--muted-foreground)]">1920x1080, pixel-perfect</p>
        </div>
      </button>
    </div>
  )
}
