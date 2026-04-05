import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Deck } from '@/lib/supabase/types'

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/slides"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold">{deck.name}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-[var(--n-radius-sm)] ${
            deck.is_public
              ? 'bg-[var(--success)] text-[var(--success-foreground)]'
              : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
          }`}>
            {deck.is_public ? 'Public' : 'Private'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/slides/${id}/analytics`}
            className="px-3 py-1.5 text-sm rounded-[var(--n-radius-md)] border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
          >
            Analytics
          </Link>
          <Link
            href={`/slides/${id}/export`}
            className="px-3 py-1.5 text-sm rounded-[var(--n-radius-md)] border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
          >
            Export
          </Link>
          <Link
            href={`/slides/${id}/settings`}
            className="px-3 py-1.5 text-sm rounded-[var(--n-radius-md)] border border-[var(--border)] hover:bg-[var(--accent)] transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>

      {deck.url || deck.deployed_url ? (
        <div className="rounded-[var(--n-radius-xl)] border border-[var(--border)] overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <iframe
            src={deck.deployed_url || deck.url || ''}
            title={deck.name}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      ) : (
        <div className="rounded-[var(--n-radius-xl)] border border-[var(--border)] bg-[var(--card)] flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
          <div className="text-center">
            <p className="text-[var(--muted-foreground)]">No URL configured</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Deploy your deck and add the URL in settings, or push via CLI.
            </p>
          </div>
        </div>
      )}

      {deck.description && (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">{deck.description}</p>
      )}
    </div>
  )
}
