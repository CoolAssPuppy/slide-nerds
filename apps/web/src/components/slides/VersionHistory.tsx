'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { History } from 'lucide-react'

type Version = {
  id: string
  version: number
  snapshot: Record<string, unknown> | null
  created_at: string
}

type VersionHistoryProps = {
  deckId: string
  currentVersion: number
}

export function VersionHistory({ deckId, currentVersion }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [rolling, setRolling] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('deck_versions')
        .select('*')
        .eq('deck_id', deckId)
        .order('version', { ascending: false })
        .limit(20)
      if (data) setVersions(data as Version[])
    }
    load()
  }, [deckId, supabase])

  const handleRollback = async (version: number) => {
    setRolling(version)

    const target = versions.find(v => v.version === version)
    if (!target?.snapshot) {
      setRolling(null)
      return
    }

    const snapshot = target.snapshot as { bundle_path?: string; bundle_size_bytes?: number }

    await supabase
      .from('decks')
      .update({
        version,
        bundle_path: snapshot.bundle_path ?? null,
        bundle_size_bytes: snapshot.bundle_size_bytes ?? null,
      })
      .eq('id', deckId)

    setRolling(null)
    window.location.reload()
  }

  if (versions.length === 0) {
    return (
      <div className="text-center text-sm text-[var(--muted-foreground)] py-6">
        <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
        No versions yet. Push or upload to create your first version.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {versions.map((v) => {
        const isCurrent = v.version === currentVersion
        const snapshot = v.snapshot as { bundle_size_bytes?: number; uploaded_at?: string } | null

        return (
          <div
            key={v.id}
            className={`flex items-center gap-3 p-3 rounded-[var(--n-radius-md)] border ${
              isCurrent ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)]'
            }`}
          >
            <div className="flex-1">
              <div className="text-sm font-medium">
                Version {v.version}
                {isCurrent && (
                  <span className="ml-2 text-xs text-[var(--primary)]">Current</span>
                )}
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {new Date(v.created_at).toLocaleString()}
                {snapshot?.bundle_size_bytes && (
                  <span className="ml-2">
                    {(snapshot.bundle_size_bytes / 1024 / 1024).toFixed(1)} MB
                  </span>
                )}
              </div>
            </div>

            {!isCurrent && (
              <button
                onClick={() => handleRollback(v.version)}
                disabled={rolling !== null}
                className="px-3 py-1.5 rounded-[var(--n-radius-sm)] border border-[var(--border)] text-xs font-medium hover:bg-[var(--accent)] disabled:opacity-50"
              >
                {rolling === v.version ? 'Restoring...' : 'Restore'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
