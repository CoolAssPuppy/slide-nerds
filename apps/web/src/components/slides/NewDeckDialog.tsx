'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type NewDeckDialogProps = {
  onClose: () => void
}

type Tab = 'link' | 'cli'

export function NewDeckDialog({ onClose }: NewDeckDialogProps) {
  const [tab, setTab] = useState<Tab>('cli')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not authenticated'); setLoading(false); return }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const { error: insertError } = await supabase.from('decks').insert({
      name: name.trim(),
      slug,
      owner_id: user.id,
      deployed_url: tab === 'link' && url.trim() ? url.trim() : null,
      source_type: tab === 'link' && url.trim() ? 'url' : 'push',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      router.refresh()
      onClose()
    }
  }

  const inputClass = 'w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'
  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-[var(--n-radius-sm)] text-sm font-medium transition-colors ${
      active
        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-[var(--n-radius-xl)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">New deck</h2>

        <div className="flex gap-1 mb-4">
          <button onClick={() => setTab('cli')} className={tabClass(tab === 'cli')}>
            Push from CLI
          </button>
          <button onClick={() => setTab('link')} className={tabClass(tab === 'link')}>
            Link URL
          </button>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="deck-name" className="block text-sm font-medium mb-1">
              Deck name
            </label>
            <input
              id="deck-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Q1 board update"
              className={inputClass}
            />
          </div>

          {tab === 'link' && (
            <div>
              <label htmlFor="deck-url" className="block text-sm font-medium mb-1">
                Deployed URL
              </label>
              <input
                id="deck-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://my-deck.vercel.app"
                className={inputClass}
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Paste the URL where your deck is deployed (Vercel, Netlify, etc.)
              </p>
            </div>
          )}

          {tab === 'cli' && (
            <div className="rounded-[var(--n-radius-md)] bg-[#0a0a0a] border border-[var(--border)] p-4">
              <p className="text-xs text-[var(--muted-foreground)] mb-3">
                Create the deck here, then push from your terminal:
              </p>
              <pre className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">
                <code>{`slidenerds login
slidenerds link
slidenerds push`}</code>
              </pre>
            </div>
          )}

          {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[var(--n-radius-md)] text-sm hover:bg-[var(--accent)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
