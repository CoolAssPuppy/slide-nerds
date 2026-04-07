'use client'

import { useEffect, useRef, useState } from 'react'
import { Filter, X } from 'lucide-react'
import type { Tag } from '@/lib/supabase/types'

type TagFilterButtonProps = {
  tags: Tag[]
  activeTagId: string | null
  onFilterChange: (tagId: string | null) => void
}

export function TagFilterButton({ tags, activeTagId, onFilterChange }: TagFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (tags.length === 0) return null

  const activeTag = tags.find((tag) => tag.id === activeTagId)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-2 rounded-[var(--n-radius-md)] border text-sm font-medium transition-all ${
          activeTag
            ? 'border-[var(--foreground)] bg-[var(--foreground)]/5 text-[var(--foreground)]'
            : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--foreground)]/30'
        }`}
      >
        <Filter size={14} />
        {activeTag ? (
          <>
            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: activeTag.color }} />
            <span className="max-w-[100px] truncate">{activeTag.name}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation()
                onFilterChange(null)
                setIsOpen(false)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.stopPropagation()
                  onFilterChange(null)
                  setIsOpen(false)
                }
              }}
              className="ml-0.5 rounded-full p-0.5 hover:bg-[var(--muted)] cursor-pointer"
            >
              <X size={12} />
            </span>
          </>
        ) : (
          <span>Filter</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-30 mt-2 w-56 rounded-[var(--n-radius-md)] border border-[var(--border)] bg-[var(--popover)] shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            type="button"
            onClick={() => {
              onFilterChange(null)
              setIsOpen(false)
            }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
              !activeTagId
                ? 'bg-[var(--accent)] text-[var(--foreground)]'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
            }`}
          >
            All decks
          </button>

          <div className="mx-3 my-1 border-t border-[var(--border)]" />

          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                onFilterChange(activeTagId === tag.id ? null : tag.id)
                setIsOpen(false)
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                activeTagId === tag.id
                  ? 'bg-[var(--accent)] text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
              <span className="truncate">{tag.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
