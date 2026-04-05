'use client'

import { useEffect, useRef } from 'react'
import { FileText, FileSpreadsheet } from 'lucide-react'

type ExportDropdownProps = {
  isOpen: boolean
  onClose: () => void
}

export function ExportDropdown({ isOpen, onClose }: ExportDropdownProps) {
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

  return (
    <div
      ref={ref}
      className="absolute right-0 top-10 w-56 rounded-[var(--n-radius-md)] border border-[var(--border)] bg-[var(--popover)] shadow-lg py-1 z-50"
    >
      <button
        disabled
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm opacity-40 cursor-not-allowed"
      >
        <FileText className="w-4 h-4 text-[var(--muted-foreground)]" />
        <div className="text-left">
          <p className="font-medium">Export as PDF</p>
          <p className="text-xs text-[var(--muted-foreground)]">Coming soon</p>
        </div>
      </button>
      <button
        disabled
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm opacity-40 cursor-not-allowed"
      >
        <FileSpreadsheet className="w-4 h-4 text-[var(--muted-foreground)]" />
        <div className="text-left">
          <p className="font-medium">Export as PPTX</p>
          <p className="text-xs text-[var(--muted-foreground)]">Coming soon</p>
        </div>
      </button>
      <p className="px-3 py-2 text-xs text-[var(--muted-foreground)] border-t border-[var(--border)]">
        Use <code className="bg-[var(--muted)] px-1 rounded">slidenerds export</code> from the CLI.
      </p>
    </div>
  )
}
