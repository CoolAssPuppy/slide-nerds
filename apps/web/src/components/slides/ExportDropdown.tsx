'use client'

import { useEffect, useRef } from 'react'
import { FileText, FileSpreadsheet } from 'lucide-react'
import type { Deck } from '@/lib/supabase/types'

type ExportDropdownProps = {
  deck: Deck
  isOpen: boolean
  onClose: () => void
}

export function ExportDropdown({ deck, isOpen, onClose }: ExportDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

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

  const hasSource = Boolean(deck.bundle_path || deck.url || deck.deployed_url)

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 w-56 rounded-[var(--n-radius-md)] border border-[var(--border)] bg-[var(--popover)] shadow-lg py-1 z-50"
    >
      <button
        disabled={!hasSource}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[var(--accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FileText className="w-4 h-4 text-[var(--muted-foreground)]" />
        <div className="text-left">
          <p className="font-medium">Export as PDF</p>
          <p className="text-xs text-[var(--muted-foreground)]">1920x1080, pixel-perfect</p>
        </div>
      </button>
      <button
        disabled={!hasSource}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[var(--accent)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FileSpreadsheet className="w-4 h-4 text-[var(--muted-foreground)]" />
        <div className="text-left">
          <p className="font-medium">Export as PPTX</p>
          <p className="text-xs text-[var(--muted-foreground)]">Native PowerPoint</p>
        </div>
      </button>
      {!hasSource && (
        <p className="px-3 py-2 text-xs text-[var(--muted-foreground)] border-t border-[var(--border)]">
          Push your deck first to enable export.
        </p>
      )}
    </div>
  )
}
