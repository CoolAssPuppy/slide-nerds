'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Tag as TagIcon, Trash2, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Deck, Tag } from '@/lib/supabase/types'
import { DeckTagEditor } from './DeckTagEditor'
import { TagPill } from './TagPill'

type DeckGridProps = {
  decks: Deck[]
  viewerCounts?: Record<string, number>
  deckTagsByDeckId?: Record<string, Tag[]>
  allTags?: Tag[]
  onDeckTagsChange?: (deckId: string, tags: Tag[]) => void
  onTagLibraryChange?: (tags: Tag[]) => void
  allowTagEdit?: boolean
  isAnimating?: boolean
}

const STAGGER_MS = 35

export function DeckGrid({
  decks,
  viewerCounts = {},
  deckTagsByDeckId = {},
  allTags = [],
  onDeckTagsChange,
  onTagLibraryChange,
  allowTagEdit = false,
  isAnimating = false,
}: DeckGridProps) {
  if (decks.length === 0 && !isAnimating) {
    return <GridEmpty />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck, index) => (
        <div
          key={deck.id}
          style={{
            transition: `opacity 240ms ease ${index * STAGGER_MS}ms, transform 240ms ease ${index * STAGGER_MS}ms`,
            opacity: isAnimating ? 0 : 1,
            transform: isAnimating ? 'scale(0.97) translateY(6px)' : 'scale(1) translateY(0)',
          }}
        >
          <DeckCard
            deck={deck}
            viewers={viewerCounts[deck.id] ?? 0}
            tags={deckTagsByDeckId[deck.id] ?? []}
            allTags={allTags}
            onTagsChange={(tags) => onDeckTagsChange?.(deck.id, tags)}
            onTagLibraryChange={onTagLibraryChange}
            allowTagEdit={allowTagEdit}
          />
        </div>
      ))}
    </div>
  )
}

function DeckCard({
  deck,
  viewers,
  tags,
  allTags,
  onTagsChange,
  onTagLibraryChange,
  allowTagEdit,
}: {
  deck: Deck
  viewers: number
  tags: Tag[]
  allTags: Tag[]
  onTagsChange: (tags: Tag[]) => void
  onTagLibraryChange?: (tags: Tag[]) => void
  allowTagEdit: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showTagEditor, setShowTagEditor] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleDelete = async () => {
    setShowMenu(false)
    if (!confirm(`Delete "${deck.name}"? This cannot be undone.`)) return
    await supabase.from('decks').delete().eq('id', deck.id)
    router.refresh()
  }

  const timeAgo = getTimeAgo(deck.updated_at)
  const hasTags = tags.length > 0

  return (
    <div className="group relative rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--primary)] transition-colors">
      <Link href={`/slides/${deck.id}`} className="block">
        <div className="aspect-video bg-[var(--muted)] relative overflow-hidden">
          {deck.thumbnail_url ? (
            <img src={deck.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : (deck.bundle_path || deck.deployed_url) ? (
            <iframe
              src={deck.bundle_path ? `/api/hosted/${deck.id}/index.html` : deck.deployed_url!}
              title={deck.name}
              className="absolute top-0 left-0 border-none pointer-events-none"
              style={{ width: '1920px', height: '1080px', transform: 'scale(var(--preview-scale))', transformOrigin: 'top left', '--preview-scale': '0.22' } as React.CSSProperties}
              sandbox={deck.bundle_path ? 'allow-scripts allow-same-origin' : undefined}
              tabIndex={-1}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[var(--muted-foreground)] text-sm">No preview</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{deck.name}</h3>
            <span className={`text-xs px-1.5 py-0.5 rounded-[var(--n-radius-sm)] shrink-0 ${
              deck.is_public
                ? 'bg-[var(--success)] text-[var(--success-foreground)]'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            }`}>
              {deck.is_public ? 'Public' : 'Private'}
            </span>
          </div>
          {hasTags && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => <TagPill key={tag.id} tag={tag} />)}
            </div>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <Users className="w-3 h-3" />
              {viewers}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">{timeAgo}</span>
          </div>
        </div>
      </Link>

      <div
        ref={menuRef}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.preventDefault()}
      >
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-7 h-7 rounded-[var(--n-radius-sm)] bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--accent)] transition-colors"
        >
          <MoreHorizontal size={14} />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-8 w-40 rounded-[var(--n-radius-md)] border border-[var(--border)] bg-[var(--popover)] shadow-lg py-1 z-10">
            {allowTagEdit && onTagLibraryChange && (
              <button
                onClick={() => {
                  setShowMenu(false)
                  setShowTagEditor(true)
                }}
                className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                <TagIcon size={14} className="text-[var(--muted-foreground)]" />
                Tag
              </button>
            )}
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-2 text-left px-3 py-1.5 text-sm text-[var(--destructive)] hover:bg-[var(--accent)] transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      {showTagEditor && allowTagEdit && onTagLibraryChange && (
        <div
          className="absolute top-2 right-2 z-20"
          onClick={(e) => e.preventDefault()}
        >
          <DeckTagEditor
            deckId={deck.id}
            deckTags={tags}
            allTags={allTags}
            onTagsChange={onTagsChange}
            onTagLibraryChange={onTagLibraryChange}
            onClose={() => setShowTagEditor(false)}
          />
        </div>
      )}
    </div>
  )
}

function GridEmpty() {
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
