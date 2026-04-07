'use client'

import { useCallback, useState } from 'react'
import { Presentation } from 'lucide-react'
import { DeckListRealtime } from './DeckListRealtime'
import { DeckGrid } from './DeckGrid'
import { TagFilterButton } from './TagFilterButton'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Deck, Tag } from '@/lib/supabase/types'

type SlidesContentProps = {
  ownDecks: Deck[]
  sharedDecks: Deck[]
  viewerCounts: Record<string, number>
  userId: string
  initialTags: Tag[]
  initialDeckTagsByDeckId: Record<string, Tag[]>
}

const ANIMATION_DURATION_MS = 260

export function SlidesContent({
  ownDecks,
  sharedDecks,
  viewerCounts,
  userId,
  initialTags,
  initialDeckTagsByDeckId,
}: SlidesContentProps) {
  const [tags, setTags] = useState(initialTags)
  const [deckTagsByDeckId, setDeckTagsByDeckId] = useState(initialDeckTagsByDeckId)
  const [activeTagId, setActiveTagId] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleFilterChange = useCallback((tagId: string | null) => {
    if (tagId === activeTagId) return
    setIsAnimating(true)
    setTimeout(() => {
      setActiveTagId(tagId)
      setIsAnimating(false)
    }, ANIMATION_DURATION_MS)
  }, [activeTagId])

  const handleTagsChange = useCallback((nextTags: Tag[]) => {
    setTags(nextTags)
    const nextTagIds = new Set(nextTags.map((tag) => tag.id))
    const nextTagById = new Map(nextTags.map((tag) => [tag.id, tag]))
    setDeckTagsByDeckId((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([deckId, existingTags]) => [
          deckId,
          existingTags
            .filter((tag) => nextTagIds.has(tag.id))
            .map((tag) => nextTagById.get(tag.id) ?? tag),
        ]),
      ),
    )
    if (activeTagId && !nextTagIds.has(activeTagId)) {
      setActiveTagId(null)
    }
  }, [activeTagId])

  const handleDeckTagsChange = useCallback((deckId: string, nextDeckTags: Tag[]) => {
    setDeckTagsByDeckId((prev) => ({ ...prev, [deckId]: nextDeckTags }))
  }, [])

  return (
    <div>
      <PageHeader
        title="Slides"
        description="All your presentation decks in one place."
        actions={
          <TagFilterButton
            tags={tags}
            activeTagId={activeTagId}
            onFilterChange={handleFilterChange}
          />
        }
        showNewDeck
      />

      <DeckListRealtime
        initialDecks={ownDecks}
        viewerCounts={viewerCounts}
        userId={userId}
        tags={tags}
        deckTagsByDeckId={deckTagsByDeckId}
        activeTagId={activeTagId}
        isAnimating={isAnimating}
        onTagsChange={handleTagsChange}
        onDeckTagsChange={handleDeckTagsChange}
      />

      {ownDecks.length === 0 && (
        <EmptyState
          icon={Presentation}
          title="No decks yet"
          description="Deploy your deck and register it with slidenerds link --url"
        />
      )}

      {sharedDecks.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            Shared with me
          </h2>
          <DeckGrid decks={sharedDecks} deckTagsByDeckId={deckTagsByDeckId} />
        </div>
      )}
    </div>
  )
}
