'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Deck } from '@/lib/supabase/types'

type DeckGridProps = {
  decks: Deck[]
}

export function DeckGrid({ decks }: DeckGridProps) {
  if (decks.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} />
      ))}
    </div>
  )
}

function DeckCard({ deck }: { deck: Deck }) {
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`Delete "${deck.name}"? This cannot be undone.`)) return
    await supabase.from('decks').delete().eq('id', deck.id)
    router.refresh()
  }

  const timeAgo = getTimeAgo(deck.updated_at)

  return (
    <div className="group relative rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--primary)] transition-colors">
      <Link href={`/slides/${deck.id}`} className="block">
        <div className="aspect-video bg-[var(--muted)] flex items-center justify-center">
          {deck.thumbnail_url ? (
            <img src={deck.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[var(--muted-foreground)] text-sm">No preview</span>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm truncate">{deck.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-[var(--muted-foreground)]">{timeAgo}</span>
            {deck.slide_count && deck.slide_count > 0 && (
              <span className="text-xs text-[var(--muted-foreground)]">
                {deck.slide_count} slides
              </span>
            )}
            <span className={`text-xs px-1.5 py-0.5 rounded-[var(--n-radius-sm)] ${
              deck.is_public
                ? 'bg-[var(--success)] text-[var(--success-foreground)]'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            }`}>
              {deck.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
      </Link>

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu) }}
          className="w-7 h-7 rounded-[var(--n-radius-sm)] bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-xs hover:bg-[var(--accent)]"
        >
          ...
        </button>
        {showMenu && (
          <div className="absolute right-0 top-8 w-36 rounded-[var(--n-radius-md)] border border-[var(--border)] bg-[var(--popover)] shadow-lg py-1 z-10">
            <Link
              href={`/slides/${deck.id}/settings`}
              className="block px-3 py-1.5 text-sm hover:bg-[var(--accent)] transition-colors"
            >
              Settings
            </Link>
            <button
              onClick={handleDelete}
              className="w-full text-left px-3 py-1.5 text-sm text-[var(--destructive)] hover:bg-[var(--accent)] transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold">No decks yet</h3>
      <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm">
        Create your first deck locally with the CLI, then push it here to host and share.
      </p>
      <pre className="mt-4 text-xs text-[var(--muted-foreground)] bg-[var(--card)] border border-[var(--border)] rounded-[var(--n-radius-md)] px-4 py-2">
        npx @strategicnerds/slide-nerds create my-deck
      </pre>
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}
