'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

type SlideOverPanelProps = {
  title: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export function SlideOverPanel({ title, isOpen, onClose, children }: SlideOverPanelProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[480px] h-full bg-[var(--card)] border-l border-[var(--border)] shadow-xl animate-slide-in-right overflow-hidden flex flex-col">
        <div className="flex items-center justify-between h-14 px-6 border-b border-[var(--border)] shrink-0">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[var(--n-radius-md)] hover:bg-[var(--accent)] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
