'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DeckGrid } from './DeckGrid'
import type { Deck, Tag } from '@/lib/supabase/types'
import { TagManagerDialog } from './TagManagerDialog'
import { TagPill } from './TagPill'
import { filterDeckIdsByTag } from './tag-utils'

type DeckListRealtimeProps = {
  initialDecks: Deck[]
  viewerCounts: Record<string, number>
  userId: string
  initialTags: Tag[]
  initialDeckTagsByDeckId: Record<string, Tag[]>
}

export function DeckListRealtime({
  initialDecks,
  viewerCounts,
  userId,
  initialTags,
  initialDeckTagsByDeckId,
}: DeckListRealtimeProps) {
  const [decks, setDecks] = useState(initialDecks)
  const [tags, setTags] = useState(initialTags)
  const [deckTagsByDeckId, setDeckTagsByDeckId] = useState(initialDeckTagsByDeckId)
  const [activeTagId, setActiveTagId] = useState<string | null>(null)
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setDecks(initialDecks)
  }, [initialDecks])

  useEffect(() => {
    setTags(initialTags)
  }, [initialTags])

  useEffect(() => {
    setDeckTagsByDeckId(initialDeckTagsByDeckId)
  }, [initialDeckTagsByDeckId])

  useEffect(() => {
    const channel = supabase
      .channel('deck-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'decks',
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          const newDeck = payload.new as Deck
          setDecks((prev) => [newDeck, ...prev])
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'decks',
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id
          setDecks((prev) => prev.filter((d) => d.id !== deletedId))
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'decks',
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Deck
          setDecks((prev) =>
            prev.map((d) => (d.id === updated.id ? updated : d)),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  if (decks.length === 0) return null

  const filteredDeckIds = filterDeckIdsByTag({
    activeTagId,
    deckIds: decks.map((deck) => deck.id),
    deckTagsByDeckId,
  })
  const filteredDecks = decks.filter((deck) => filteredDeckIds.includes(deck.id))

  return (
    <div className="mb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          My decks
        </h2>
        <button
          type="button"
          onClick={() => setIsTagManagerOpen(true)}
          className="rounded-[var(--n-radius-sm)] border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          Manage tags
        </button>
      </div>

      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTagId(null)}
            className={`rounded-full border px-2.5 py-1 text-xs ${activeTagId ? 'border-[var(--border)] text-[var(--muted-foreground)]' : 'border-[var(--foreground)] text-[var(--foreground)]'}`}
          >
            All
          </button>
          {tags.map((tag) => (
            <TagPill
              key={tag.id}
              tag={tag}
              isActive={activeTagId === tag.id}
              onClick={() => setActiveTagId(activeTagId === tag.id ? null : tag.id)}
            />
          ))}
        </div>
      )}

      <DeckGrid
        decks={filteredDecks}
        viewerCounts={viewerCounts}
        deckTagsByDeckId={deckTagsByDeckId}
        allTags={tags}
        allowTagEdit
        onTagLibraryChange={(nextTags) => setTags(nextTags)}
        onDeckTagsChange={(deckId, nextDeckTags) => {
          setDeckTagsByDeckId((previous) => ({ ...previous, [deckId]: nextDeckTags }))
        }}
      />

      <TagManagerDialog
        isOpen={isTagManagerOpen}
        tags={tags}
        onClose={() => setIsTagManagerOpen(false)}
        onTagsChange={(nextTags) => {
          const nextTagIds = new Set(nextTags.map((tag) => tag.id))
          const nextTagById = new Map(nextTags.map((tag) => [tag.id, tag]))
          setTags(nextTags)
          setDeckTagsByDeckId((previous) =>
            Object.fromEntries(
              Object.entries(previous).map(([deckId, existingDeckTags]) => [
                deckId,
                existingDeckTags
                  .filter((tag) => nextTagIds.has(tag.id))
                  .map((tag) => nextTagById.get(tag.id) ?? tag),
              ]),
            ),
          )
        }}
      />
    </div>
  )
}
