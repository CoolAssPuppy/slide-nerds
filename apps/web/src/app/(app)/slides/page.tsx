import { createClient } from '@/lib/supabase/server'
import { Presentation } from 'lucide-react'
import { DeckListRealtime } from '@/components/slides/DeckListRealtime'
import { DeckGrid } from '@/components/slides/DeckGrid'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { buildDeckTagsByDeckId } from '@/components/slides/tag-utils'
import type { Deck, DeckTag, Tag } from '@/lib/supabase/types'

export const metadata = { title: 'Slides' }

export default async function SlidesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: ownData } = await supabase
    .from('decks')
    .select('*')
    .eq('owner_id', user!.id)
    .order('updated_at', { ascending: false })
  const ownDecks = (ownData ?? []) as Deck[]

  const deckIds = ownDecks.map((d) => d.id)
  const viewerCounts: Record<string, number> = {}
  if (deckIds.length > 0) {
    const { data: viewsData } = await supabase
      .from('deck_views')
      .select('deck_id, viewer_id, ip_hash')
      .in('deck_id', deckIds)
    if (viewsData) {
      const viewerSets = new Map<string, Set<string>>()
      for (const v of viewsData) {
        const key = v.viewer_id || v.ip_hash || 'anon'
        const set = viewerSets.get(v.deck_id) ?? new Set()
        set.add(key)
        viewerSets.set(v.deck_id, set)
      }
      for (const [deckId, set] of viewerSets) {
        viewerCounts[deckId] = set.size
      }
    }
  }

  const { data: sharedData } = await supabase
    .from('decks')
    .select('*')
    .eq('is_public', true)
    .neq('owner_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(20)
  const sharedDecks = (sharedData ?? []) as Deck[]
  const allDeckIds = [...ownDecks, ...sharedDecks].map((deck) => deck.id)

  const { data: tagsData } = await supabase
    .from('tags')
    .select('*')
    .eq('owner_id', user!.id)
    .order('name', { ascending: true })

  const { data: deckTagsData } = allDeckIds.length > 0
    ? await supabase.from('deck_tags').select('*').in('deck_id', allDeckIds)
    : { data: [] }

  const tags = (tagsData ?? []) as Tag[]
  const deckTags = (deckTagsData ?? []) as DeckTag[]
  const deckTagsByDeckId = buildDeckTagsByDeckId({ deckTags, tags })

  return (
    <div>
      <PageHeader
        title="Slides"
        description="All your presentation decks in one place."
        showNewDeck
      />

      <DeckListRealtime
        initialDecks={ownDecks}
        viewerCounts={viewerCounts}
        userId={user!.id}
        initialTags={tags}
        initialDeckTagsByDeckId={deckTagsByDeckId}
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
