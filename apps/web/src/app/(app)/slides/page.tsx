import { createClient } from '@/lib/supabase/server'
import { DeckGrid } from '@/components/slides/DeckGrid'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Deck } from '@/lib/supabase/types'

export const metadata = { title: 'Slides' }

export default async function SlidesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Own decks
  const { data: ownData } = await supabase
    .from('decks')
    .select('*')
    .eq('owner_id', user!.id)
    .order('updated_at', { ascending: false })
  const ownDecks = (ownData ?? []) as Deck[]

  // Fetch viewer counts for own decks
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

  // Shared with me (public decks from share links where I'm an allowed email)
  // For now, show decks that are public and not owned by me
  const { data: sharedData } = await supabase
    .from('decks')
    .select('*')
    .eq('is_public', true)
    .neq('owner_id', user!.id)
    .order('updated_at', { ascending: false })
    .limit(20)
  const sharedDecks = (sharedData ?? []) as Deck[]

  return (
    <div>
      <PageHeader
        title="Slides"
        description="All your presentation decks in one place."
        showNewDeck
      />

      {ownDecks.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            My decks
          </h2>
          <DeckGrid decks={ownDecks} viewerCounts={viewerCounts} />
        </div>
      )}

      {ownDecks.length === 0 && (
        <div className="mb-8 text-center py-12 rounded-[var(--n-radius-lg)] border border-dashed border-[var(--border)]">
          <p className="text-[var(--muted-foreground)] mb-2">No decks yet</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Deploy your deck and register it with <code className="text-[var(--primary)]">slidenerds link --url</code>
          </p>
        </div>
      )}

      {sharedDecks.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            Shared with me
          </h2>
          <DeckGrid decks={sharedDecks} />
        </div>
      )}
    </div>
  )
}
