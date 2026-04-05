import { createClient } from '@/lib/supabase/server'
import { DeckGrid } from '@/components/slides/DeckGrid'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Deck } from '@/lib/supabase/types'

export const metadata = { title: 'My slides' }

export default async function SlidesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('decks')
    .select('*')
    .eq('owner_id', user!.id)
    .order('updated_at', { ascending: false })

  const decks = (data ?? []) as Deck[]

  return (
    <div>
      <PageHeader
        title="My slides"
        description="All your presentation decks in one place."
        showNewDeck
      />
      <DeckGrid decks={decks} />
    </div>
  )
}
