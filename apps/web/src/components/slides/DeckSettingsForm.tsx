'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Deck } from '@/lib/supabase/types'

export function DeckSettingsForm({ deck }: { deck: Deck }) {
  const [name, setName] = useState(deck.name)
  const [description, setDescription] = useState(deck.description ?? '')
  const [slug, setSlug] = useState(deck.slug ?? '')
  const [isPublic, setIsPublic] = useState(deck.is_public ?? false)
  const [url, setUrl] = useState(deck.url ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    await supabase
      .from('decks')
      .update({
        name,
        description: description || null,
        slug: slug || null,
        is_public: isPublic,
        url: url || null,
      })
      .eq('id', deck.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const handleDelete = async () => {
    if (deleteConfirm !== deck.name) return
    await supabase.from('decks').delete().eq('id', deck.id)
    router.push('/slides')
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          General
        </h2>

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
            <span>slidenerds.com/d/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deployed URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://my-deck.vercel.app"
            className="w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      </section>

      <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Sharing
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Public</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Anyone with the link can view this deck.
            </p>
          </div>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              isPublic ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                isPublic ? 'left-[22px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {isPublic && slug && (
          <div className="flex items-center gap-2 p-3 rounded-[var(--n-radius-md)] bg-[var(--muted)]">
            <span className="text-sm text-[var(--muted-foreground)] truncate flex-1">
              slidenerds.com/d/{slug}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(`https://slidenerds.com/d/${slug}`)}
              className="text-xs text-[var(--primary)] hover:underline shrink-0"
            >
              Copy
            </button>
          </div>
        )}
      </section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saved ? 'Saved' : saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      <section className="rounded-[var(--n-radius-lg)] border border-[var(--destructive)]/30 bg-[var(--card)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--destructive)] uppercase tracking-wider">
          Danger zone
        </h2>
        <div>
          <p className="text-sm mb-2">
            Type <strong>{deck.name}</strong> to delete this deck permanently.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={deck.name}
              className="flex-1 h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--destructive)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--destructive)]"
            />
            <button
              onClick={handleDelete}
              disabled={deleteConfirm !== deck.name}
              className="px-4 h-10 rounded-[var(--n-radius-md)] bg-[var(--destructive)] text-[var(--destructive-foreground)] text-sm font-medium disabled:opacity-50 transition-opacity"
            >
              Delete
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
