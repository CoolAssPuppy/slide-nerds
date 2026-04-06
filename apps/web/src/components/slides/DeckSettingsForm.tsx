'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Deck } from '@/lib/supabase/types'

type LiveSession = {
  id: string
  name: string | null
  status: 'active' | 'ended'
  audience_count: number | null
  started_at: string
  ended_at: string | null
}

export function DeckSettingsForm({ deck }: { deck: Deck }) {
  const [name, setName] = useState(deck.name)
  const [description, setDescription] = useState(deck.description ?? '')
  const [slug, setSlug] = useState(deck.slug ?? '')
  const [isPublic, setIsPublic] = useState(deck.is_public ?? false)
  const [url, setUrl] = useState(deck.url ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [newSessionName, setNewSessionName] = useState('')
  const [creatingSession, setCreatingSession] = useState(false)
  const [sessionError, setSessionError] = useState('')
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchSessions = useCallback(async () => {
    try {
      const resp = await fetch(`/api/decks/${deck.id}/live-sessions`)
      if (resp.ok) {
        setSessions(await resp.json())
      }
    } catch {
      // Network error, sessions will show stale data
    }
  }, [deck.id])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) return
    setCreatingSession(true)
    setSessionError('')
    setCreatedSessionId(null)

    const resp = await fetch(`/api/decks/${deck.id}/live-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newSessionName.trim() }),
    })

    if (resp.ok) {
      const session = await resp.json()
      setCreatedSessionId(session.id)
      setNewSessionName('')
      await fetchSessions()
    } else {
      const err = await resp.json().catch(() => ({ error: 'Failed to create session' }))
      setSessionError(err.error)
    }

    setCreatingSession(false)
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/decks/${deck.id}/live-sessions/${sessionId}`, { method: 'DELETE' })
      if (createdSessionId === sessionId) setCreatedSessionId(null)
      await fetchSessions()
    } catch {
      setSessionError('Failed to delete session')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase
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
    if (error) {
      setSessionError('Failed to save settings')
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
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

      <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
          Live sessions
        </h2>

        <div className="flex gap-2">
          <input
            type="text"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
            placeholder="Session name (e.g. Q2 All-Hands)"
            className="flex-1 h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <button
            onClick={handleCreateSession}
            disabled={creatingSession || !newSessionName.trim()}
            className="px-4 h-10 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
          >
            {creatingSession ? 'Creating...' : 'Create'}
          </button>
        </div>

        {sessionError && (
          <p className="text-sm text-[var(--destructive)]">{sessionError}</p>
        )}

        {createdSessionId && (
          <div className="rounded-[var(--n-radius-md)] border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 space-y-3">
            <p className="text-sm font-medium">Session created. Use it in your deck:</p>
            <CopyBlock value={`<LivePoll
  question="Your question"
  options={['A', 'B', 'C']}
  sessionId="${createdSessionId}"
  serviceUrl="${window.location.origin}"
/>`} />
            <p className="text-xs text-[var(--muted-foreground)] mt-2">Or share this URL with your audience:</p>
            <CopyBlock value={`${deck.deployed_url || deck.url || 'https://your-deck.example.com'}?session=${createdSessionId}`} />
          </div>
        )}

        {sessions.length > 0 ? (
          <div className="divide-y divide-[var(--border)] rounded-[var(--n-radius-md)] border border-[var(--border)] overflow-hidden">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3 px-4 py-3 bg-[var(--background)]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.name ?? 'Unnamed session'}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {new Date(session.started_at).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  session.status === 'active'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                }`}>
                  {session.status}
                </span>
                <button
                  onClick={() => handleDeleteSession(session.id)}
                  className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors p-1"
                  title="Delete session"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted-foreground)]">
            No live sessions yet. Create one to enable polls, reactions, and Q&A in your deck.
          </p>
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

    </div>
  )
}

function CopyBlock({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="relative group">
      <div className="rounded-[var(--n-radius-md)] bg-[var(--muted)] p-3 pr-16 text-xs font-mono overflow-x-auto whitespace-pre">
        {value}
      </div>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 rounded-[var(--n-radius-sm)] text-xs bg-[var(--background)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}
