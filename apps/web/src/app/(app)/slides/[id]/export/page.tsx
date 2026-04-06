import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Deck } from '@/lib/supabase/types'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ExportPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: deckData } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .single()
  const deck = deckData as Deck | null
  if (!deck) notFound()

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/slides/${id}`} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Export</h1>
        <span className="text-sm text-[var(--muted-foreground)]">{deck.name}</span>
      </div>

      <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold mb-2">Export as PDF</h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Server-rendered PDF at 1920x1080. Pixel-perfect, handles all CSS and SVGs.
        </p>
        <button
          className="px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
          disabled={!deck.url && !deck.deployed_url}
        >
          Export PDF
        </button>
        {!deck.url && !deck.deployed_url && (
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Add a deployed URL in settings first.
          </p>
        )}
      </div>
    </div>
  )
}
