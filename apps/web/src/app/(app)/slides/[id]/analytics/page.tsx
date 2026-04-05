import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ViewsChart } from '@/components/analytics/ViewsChart'
import { SlideTimeChart } from '@/components/analytics/SlideTimeChart'
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
    .limit(500)
  const views = (viewsData ?? []) as DeckView[]

  const totalViews = views.length
  const uniqueViewers = new Set(views.map((v) => v.viewer_id || v.ip_hash).filter(Boolean)).size
  const avgTime = views.length > 0
    ? Math.round(views.reduce((sum, v) => sum + (v.total_time_seconds ?? v.dwell_seconds ?? 0), 0) / views.length)
    : 0

  // Aggregate views by date for the chart (last 30 days)
  const viewsByDate = aggregateViewsByDate(views)

  // Aggregate time per slide
  const slideTime = aggregateSlideTime(views)

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
        <StatCard label="Total views" value={String(totalViews)} />
        <StatCard label="Unique viewers" value={String(uniqueViewers)} />
        <StatCard label="Avg time" value={`${avgTime}s`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-sm font-semibold mb-4">Views over time</h2>
          <ViewsChart data={viewsByDate} />
        </div>
        <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-sm font-semibold mb-4">Time per slide</h2>
          <SlideTimeChart data={slideTime} />
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5">
      <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  )
}

function aggregateViewsByDate(views: DeckView[]): { date: string; count: number }[] {
  const counts = new Map<string, number>()

  // Fill last 30 days
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(5, 10) // MM-DD
    counts.set(key, 0)
  }

  for (const view of views) {
    const key = new Date(view.created_at).toISOString().slice(5, 10)
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }

  return Array.from(counts.entries()).map(([date, count]) => ({ date, count }))
}

function aggregateSlideTime(views: DeckView[]): { slideIndex: number; avgSeconds: number }[] {
  const totals = new Map<number, { sum: number; count: number }>()

  for (const view of views) {
    const idx = view.slide_index
    const existing = totals.get(idx) ?? { sum: 0, count: 0 }
    existing.sum += view.dwell_seconds ?? 0
    existing.count += 1
    totals.set(idx, existing)
  }

  return Array.from(totals.entries())
    .sort(([a], [b]) => a - b)
    .map(([slideIndex, { sum, count }]) => ({
      slideIndex,
      avgSeconds: Math.round(sum / count),
    }))
}
