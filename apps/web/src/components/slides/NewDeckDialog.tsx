'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload } from 'lucide-react'

type NewDeckDialogProps = {
  onClose: () => void
}

type Tab = 'link' | 'upload' | 'cli'

export function NewDeckDialog({ onClose }: NewDeckDialogProps) {
  const [tab, setTab] = useState<Tab>('link')
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
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

    // Create the deck first
    const { data: deck, error: insertError } = await supabase.from('decks').insert({
      name: name.trim(),
      slug,
      owner_id: user.id,
      deployed_url: tab === 'link' && url.trim() ? url.trim() : null,
      source_type: tab === 'link' && url.trim() ? 'url' : 'push',
    }).select().single()

    if (insertError || !deck) {
      setError(insertError?.message ?? 'Failed to create deck')
      setLoading(false)
      return
    }

    // If uploading a file, push it to the deck
    if (tab === 'upload' && file) {
      setUploadProgress('Uploading...')
      const formData = new FormData()
      formData.append('file', file)

      const resp = await fetch(`/api/decks/${deck.id}/push`, {
        method: 'POST',
        body: formData,
      })

      if (!resp.ok) {
        const data = await resp.json()
        setError(data.error ?? 'Upload failed')
        setLoading(false)
        setUploadProgress('')
        return
      }
    }

    router.refresh()
    onClose()
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
          <button onClick={() => setTab('link')} className={tabClass(tab === 'link')}>
            Link URL
          </button>
          <button onClick={() => setTab('upload')} className={tabClass(tab === 'upload')}>
            Upload
          </button>
          <button onClick={() => setTab('cli')} className={tabClass(tab === 'cli')}>
            CLI
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

          {tab === 'upload' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Deck bundle (zip)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-[var(--n-radius-md)] border-2 border-dashed border-[var(--border)] p-6 text-center cursor-pointer hover:border-[var(--primary)] transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-[var(--muted-foreground)]" />
                {file ? (
                  <p className="text-sm">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Click to select or drag a zip file
                  </p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Upload the zip of your <code className="text-[var(--primary)]">out/</code> directory from <code className="text-[var(--primary)]">next build</code>
              </p>
            </div>
          )}

          {tab === 'cli' && (
            <div className="rounded-[var(--n-radius-md)] bg-[#0a0a0a] border border-[var(--border)] p-4">
              <pre className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">
                <code>{`# Link your project
slidenerds link

# Build and push
slidenerds push`}</code>
              </pre>
              <p className="text-xs text-[var(--muted-foreground)] mt-3">
                Create the deck first, then push from your terminal.
              </p>
            </div>
          )}

          {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
          {uploadProgress && <p className="text-sm text-[var(--muted-foreground)]">{uploadProgress}</p>}

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
              {loading ? (uploadProgress || 'Creating...') : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
