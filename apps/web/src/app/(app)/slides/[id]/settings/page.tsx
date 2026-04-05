import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeckSettingsForm } from '@/components/slides/DeckSettingsForm'
import type { Deck } from '@/lib/supabase/types'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DeckSettingsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .single()

  const deck = data as Deck | null
  if (!deck) notFound()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={`/slides/${id}`}
          className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Settings</h1>
        <span className="text-sm text-[var(--muted-foreground)]">{deck.name}</span>
      </div>

      <DeckSettingsForm deck={deck} />
    </div>
  )
}
