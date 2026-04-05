import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Deck } from '@/lib/supabase/types'
import { DeckDetailClient } from '@/components/slides/DeckDetailClient'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DeckPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .single()

  const deck = data as Deck | null
  if (!deck) notFound()

  return <DeckDetailClient deck={deck} />
}
