import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Deck, DeckView } from '@/lib/supabase/types'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function AnalyticsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: deckData } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .single()
  const deck = deckData as Deck | null
  if (!deck) notFound()

  const { data: viewsData } = await supabase
    .from('deck_views')
    .select('*')
    .eq('deck_id', id)
    .order('created_at', { ascending: false })
    .limit(100)
  const views = (viewsData ?? []) as DeckView[]

  const totalViews = views.length
  const uniqueViewers = new Set(views.map((v) => v.viewer_id || v.ip_hash).filter(Boolean)).size
  const avgTime = views.length > 0
    ? Math.round(views.reduce((sum, v) => sum + (v.total_time_seconds ?? v.dwell_seconds ?? 0), 0) / views.length)
    : 0

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/slides/${id}`} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <span className="text-sm text-[var(--muted-foreground)]">{deck.name}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Total views</p>
          <p className="text-3xl font-bold mt-2">{totalViews}</p>
        </div>
        <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Unique viewers</p>
          <p className="text-3xl font-bold mt-2">{uniqueViewers}</p>
        </div>
        <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
          <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Avg time</p>
          <p className="text-3xl font-bold mt-2">{avgTime}s</p>
        </div>
      </div>

      <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold">Recent views</h2>
        </div>
        {views.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--muted-foreground)]">
            No views yet. Share your deck to start tracking.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th className="text-left px-5 py-2 font-medium">Slide</th>
                <th className="text-left px-5 py-2 font-medium">Duration</th>
                <th className="text-left px-5 py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {views.slice(0, 20).map((view) => (
                <tr key={view.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-5 py-2">Slide {view.slide_index + 1}</td>
                  <td className="px-5 py-2">{view.dwell_seconds}s</td>
                  <td className="px-5 py-2 text-[var(--muted-foreground)]">
                    {new Date(view.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
