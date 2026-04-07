import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Deck, Tag } from '@/lib/supabase/types'
import { DeckDetailClient } from '@/components/slides/DeckDetailClient'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DeckPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .single()

  const deck = data as Deck | null
  if (!deck) notFound()

  const [{ data: tagsData }, { data: deckTagRows }] = await Promise.all([
    supabase.from('tags').select('*').eq('owner_id', deck.owner_id).order('name', { ascending: true }),
    supabase.from('deck_tags').select('tag_id').eq('deck_id', deck.id),
  ])

  const tags = (tagsData ?? []) as Tag[]
  const deckTagIds = new Set((deckTagRows ?? []).map((row) => row.tag_id))
  const deckTags = tags.filter((tag) => deckTagIds.has(tag.id))

  return <DeckDetailClient deck={deck} initialTags={tags} initialDeckTags={deckTags} canEditTags={user?.id === deck.owner_id} />
}
