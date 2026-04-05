import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Deck } from '@/lib/supabase/types'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function DeckViewerPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: deckData } = await supabase
    .from('decks')
    .select('*')
    .eq('slug', slug)
    .single()

  const deck = deckData as Deck | null
  if (!deck) notFound()

  if (!deck.is_public) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">This deck is private</h1>
          <p className="text-[var(--muted-foreground)]">
            You need permission to view this presentation.
          </p>
        </div>
      </div>
    )
  }

  const deckUrl = deck.deployed_url || deck.url
  if (!deckUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{deck.name}</h1>
          <p className="text-[var(--muted-foreground)]">
            This deck has not been deployed yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen">
      <iframe
        src={deckUrl}
        title={deck.name}
        className="w-full h-full border-none"
        allow="fullscreen"
      />
    </div>
  )
}
