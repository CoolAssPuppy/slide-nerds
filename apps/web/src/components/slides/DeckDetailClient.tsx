'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart3, Download, Settings } from 'lucide-react'
import type { Deck, Tag } from '@/lib/supabase/types'
import { SlideOverPanel } from './SlideOverPanel'
import { ExportDropdown } from './ExportDropdown'
import { AnalyticsPanel } from './AnalyticsPanel'
import { DeckSettingsForm } from './DeckSettingsForm'
import { DeckTagEditor } from './DeckTagEditor'
import { TagPill } from './TagPill'

type DeckDetailClientProps = {
  deck: Deck
  initialTags: Tag[]
  initialDeckTags: Tag[]
  canEditTags: boolean
}

export function DeckDetailClient({ deck, initialTags, initialDeckTags, canEditTags }: DeckDetailClientProps) {
  const [activePanel, setActivePanel] = useState<'analytics' | 'settings' | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [tags, setTags] = useState(initialTags)
  const [deckTags, setDeckTags] = useState(initialDeckTags)

  const viewerUrl = deck.bundle_path
    ? `/api/hosted/${deck.id}/index.html`
    : deck.deployed_url || deck.url || null

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

        <div className="flex items-center gap-1">
          <button
            onClick={() => setActivePanel(activePanel === 'analytics' ? null : 'analytics')}
            className={`w-8 h-8 rounded-[var(--n-radius-md)] flex items-center justify-center transition-colors ${
              activePanel === 'analytics'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--muted-foreground)]'
            }`}
            title="Analytics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className={`w-8 h-8 rounded-[var(--n-radius-md)] flex items-center justify-center transition-colors ${
                showExport
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                  : 'border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--muted-foreground)]'
              }`}
              title="Export"
            >
              <Download className="w-4 h-4" />
            </button>
            <ExportDropdown deckId={deck.id} isOpen={showExport} onClose={() => setShowExport(false)} />
          </div>

          <button
            onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
            className={`w-8 h-8 rounded-[var(--n-radius-md)] flex items-center justify-center transition-colors ${
              activePanel === 'settings'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                : 'border border-[var(--border)] hover:bg-[var(--accent)] text-[var(--muted-foreground)]'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {viewerUrl ? (
        <div className="rounded-[var(--n-radius-xl)] border border-[var(--border)] overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <iframe
            src={viewerUrl}
            title={deck.name}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      ) : (
        <div className="rounded-[var(--n-radius-xl)] border border-[var(--border)] bg-[var(--card)] flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
          <div className="text-center">
            <p className="text-[var(--muted-foreground)]">No content yet</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              Deploy your deck and run <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded-[var(--n-radius-sm)]">slidenerds link --url your-url</code> to connect it.
            </p>
          </div>
        </div>
      )}

      {deck.description && (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">{deck.description}</p>
      )}

      <div className="mt-4 rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Tags</p>
          {canEditTags && (
            <DeckTagEditor
              deckId={deck.id}
              deckTags={deckTags}
              allTags={tags}
              onTagsChange={setDeckTags}
              onTagLibraryChange={setTags}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {deckTags.map((tag) => <TagPill key={tag.id} tag={tag} />)}
          {deckTags.length === 0 && <p className="text-xs text-[var(--muted-foreground)]">No tags yet</p>}
        </div>
      </div>

      <SlideOverPanel
        title="Analytics"
        isOpen={activePanel === 'analytics'}
        onClose={() => setActivePanel(null)}
      >
        <AnalyticsPanel deckId={deck.id} />
      </SlideOverPanel>

      <SlideOverPanel
        title="Settings"
        isOpen={activePanel === 'settings'}
        onClose={() => setActivePanel(null)}
      >
        <DeckSettingsForm deck={deck} />
      </SlideOverPanel>
    </div>
  )
}
