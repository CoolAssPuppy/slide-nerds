'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ViewsChart } from '@/components/analytics/ViewsChart'
import { SlideTimeChart } from '@/components/analytics/SlideTimeChart'
import type { DeckView } from '@/lib/supabase/types'

type AnalyticsPanelProps = {
  deckId: string
}

export function AnalyticsPanel({ deckId }: AnalyticsPanelProps) {
  const [views, setViews] = useState<DeckView[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchViews = async () => {
      const { data } = await supabase
        .from('deck_views')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: false })
        .limit(500)

      setViews((data ?? []) as DeckView[])
      setLoading(false)
    }

    fetchViews()
  }, [deckId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[var(--muted-foreground)]">Loading analytics...</p>
      </div>
    )
  }

  const totalViews = views.length
  const uniqueViewers = new Set(views.map((v) => v.viewer_id || v.ip_hash).filter(Boolean)).size
  const avgTime = views.length > 0
    ? Math.round(views.reduce((sum, v) => sum + (v.total_time_seconds ?? v.dwell_seconds ?? 0), 0) / views.length)
    : 0

  const viewsByDate = aggregateViewsByDate(views)
  const slideTime = aggregateSlideTime(views)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Views" value={String(totalViews)} />
        <StatCard label="Unique" value={String(uniqueViewers)} />
        <StatCard label="Avg time" value={`${avgTime}s`} />
      </div>

      <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4">
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Views over time</h3>
        <ViewsChart data={viewsByDate} />
      </div>

      <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4">
        <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Time per slide</h3>
        <SlideTimeChart data={slideTime} />
      </div>

      <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--background)] overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[var(--border)]">
          <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Recent views</h3>
        </div>
        {views.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--muted-foreground)]">
            No views yet. Share your deck to start tracking.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th className="text-left px-4 py-2 font-medium text-xs">Slide</th>
                <th className="text-left px-4 py-2 font-medium text-xs">Duration</th>
                <th className="text-left px-4 py-2 font-medium text-xs">Date</th>
              </tr>
            </thead>
            <tbody>
              {views.slice(0, 20).map((view) => (
                <tr key={view.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2">Slide {view.slide_index + 1}</td>
                  <td className="px-4 py-2">{view.dwell_seconds}s</td>
                  <td className="px-4 py-2 text-[var(--muted-foreground)]">
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
    <div className="rounded-[var(--n-radius-md)] border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="text-xl font-bold mt-1">{value}</p>
    </div>
  )
}

function aggregateViewsByDate(views: DeckView[]): { date: string; count: number }[] {
  const counts = new Map<string, number>()
  const now = new Date()

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    counts.set(d.toISOString().slice(5, 10), 0)
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
    const existing = totals.get(view.slide_index) ?? { sum: 0, count: 0 }
    existing.sum += view.dwell_seconds ?? 0
    existing.count += 1
    totals.set(view.slide_index, existing)
  }

  return Array.from(totals.entries())
    .sort(([a], [b]) => a - b)
    .map(([slideIndex, { sum, count }]) => ({
      slideIndex,
      avgSeconds: Math.round(sum / count),
    }))
}
