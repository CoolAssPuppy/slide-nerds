import type { DeckTag, Tag } from '@/lib/supabase/types'

export function normalizeTagName(rawName: string): string {
  return rawName.trim().replace(/\s+/g, ' ').slice(0, 40)
}

export function buildDeckTagsByDeckId(options: {
  deckTags: DeckTag[]
  tags: Tag[]
}): Record<string, Tag[]> {
  const tagById = new Map(options.tags.map((tag) => [tag.id, tag]))

  return options.deckTags.reduce<Record<string, Tag[]>>((acc, deckTag) => {
    const tag = tagById.get(deckTag.tag_id)
    if (!tag) {
      return acc
    }

    const existing = acc[deckTag.deck_id] ?? []
    acc[deckTag.deck_id] = [...existing, tag]
    return acc
  }, {})
}

export function filterDeckIdsByTag(options: {
  activeTagId: string | null
  deckIds: string[]
  deckTagsByDeckId: Record<string, Tag[]>
}): string[] {
  if (!options.activeTagId) {
    return options.deckIds
  }

  return options.deckIds.filter((deckId) =>
    (options.deckTagsByDeckId[deckId] ?? []).some((tag) => tag.id === options.activeTagId),
  )
}
