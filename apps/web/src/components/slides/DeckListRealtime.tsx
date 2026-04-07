'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DeckGrid } from './DeckGrid'
import type { Deck, Tag } from '@/lib/supabase/types'
import { filterDeckIdsByTag } from './tag-utils'

type DeckListRealtimeProps = {
  initialDecks: Deck[]
  viewerCounts: Record<string, number>
  userId: string
  tags: Tag[]
  deckTagsByDeckId: Record<string, Tag[]>
  activeTagId: string | null
  isAnimating: boolean
  onTagsChange: (tags: Tag[]) => void
  onDeckTagsChange: (deckId: string, tags: Tag[]) => void
}

export function DeckListRealtime({
  initialDecks,
  viewerCounts,
  userId,
  tags,
  deckTagsByDeckId,
  activeTagId,
  isAnimating,
  onTagsChange,
  onDeckTagsChange,
}: DeckListRealtimeProps) {
  const [decks, setDecks] = useState(initialDecks)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setDecks(initialDecks)
  }, [initialDecks])

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
      <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
        My decks
      </h2>

      <DeckGrid
        decks={filteredDecks}
        viewerCounts={viewerCounts}
        deckTagsByDeckId={deckTagsByDeckId}
        allTags={tags}
        allowTagEdit
        isAnimating={isAnimating}
        onTagLibraryChange={onTagsChange}
        onDeckTagsChange={onDeckTagsChange}
      />
    </div>
  )
}
