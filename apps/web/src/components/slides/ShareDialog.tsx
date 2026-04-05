'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Copy, Check, Link, Lock, Mail, Globe } from 'lucide-react'
import type { ShareLink } from '@/lib/supabase/types'

type ShareDialogProps = {
  deckId: string
  deckSlug: string
  isPublic: boolean
  onClose: () => void
}

type AccessType = 'public' | 'email' | 'domain' | 'password'

export function ShareDialog({ deckId, deckSlug, isPublic, onClose }: ShareDialogProps) {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [accessType, setAccessType] = useState<AccessType>('public')
  const [emails, setEmails] = useState('')
  const [domains, setDomains] = useState('')
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('share_links')
        .select('*')
        .eq('deck_id', deckId)
        .order('created_at', { ascending: false })
      if (data) setShareLinks(data as ShareLink[])
    }
    load()
  }, [deckId, supabase])

  const handleCreate = async () => {
    setCreating(true)

    const resp = await fetch(`/api/decks/${deckId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_type: accessType,
        allowed_emails: accessType === 'email' ? emails.split(',').map(e => e.trim().toLowerCase()) : null,
        allowed_domains: accessType === 'domain' ? domains.split(',').map(d => d.trim().toLowerCase()) : null,
        password: accessType === 'password' ? password : null,
      }),
    })

    if (resp.ok) {
      const link = await resp.json()
      setShareLinks([link, ...shareLinks])
      setEmails('')
      setDomains('')
      setPassword('')
    }

    setCreating(false)
  }

  const copyLink = (token: string) => {
    const url = `https://slidenerds.com/d/${deckSlug}?token=${token}`
    navigator.clipboard.writeText(url)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteLink = async (id: string) => {
    await supabase.from('share_links').delete().eq('id', id)
    setShareLinks(shareLinks.filter(l => l.id !== id))
  }

  const inputClass = 'w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'

  const accessOptions: { type: AccessType; label: string; icon: React.ReactNode; description: string }[] = [
    { type: 'public', label: 'Public link', icon: <Globe className="w-4 h-4" />, description: 'Anyone with the link' },
    { type: 'email', label: 'Email list', icon: <Mail className="w-4 h-4" />, description: 'Specific emails only' },
    { type: 'domain', label: 'Domain', icon: <Link className="w-4 h-4" />, description: 'Specific email domains' },
    { type: 'password', label: 'Password', icon: <Lock className="w-4 h-4" />, description: 'Require a password' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-[var(--n-radius-xl)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Share deck</h2>

        {isPublic && (
          <div className="flex items-center gap-2 p-3 rounded-[var(--n-radius-md)] bg-[var(--muted)] mb-4">
            <Globe className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm text-[var(--muted-foreground)] truncate flex-1">
              slidenerds.com/d/{deckSlug}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://slidenerds.com/d/${deckSlug}`)
                setCopied('public')
                setTimeout(() => setCopied(null), 2000)
              }}
              className="text-xs text-[var(--primary)] hover:underline shrink-0"
            >
              {copied === 'public' ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        <div className="space-y-3 mb-4">
          <label className="block text-sm font-medium">Create a share link</label>
          <div className="grid grid-cols-2 gap-2">
            {accessOptions.map(({ type, label, icon, description }) => (
              <button
                key={type}
                onClick={() => setAccessType(type)}
                className={`flex items-center gap-2 p-3 rounded-[var(--n-radius-md)] border text-left text-sm transition-colors ${
                  accessType === type
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                    : 'border-[var(--border)] hover:bg-[var(--accent)]'
                }`}
              >
                {icon}
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{description}</div>
                </div>
              </button>
            ))}
          </div>

          {accessType === 'email' && (
            <input
              type="text"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="alice@company.com, bob@company.com"
              className={inputClass}
            />
          )}

          {accessType === 'domain' && (
            <input
              type="text"
              value={domains}
              onChange={(e) => setDomains(e.target.value)}
              placeholder="company.com, partner.com"
              className={inputClass}
            />
          )}

          {accessType === 'password' && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Set a password"
              className={inputClass}
            />
          )}

          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full h-10 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {creating ? 'Creating...' : 'Create link'}
          </button>
        </div>

        {shareLinks.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">Active links</label>
            {shareLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-2 p-2 rounded-[var(--n-radius-sm)] bg-[var(--muted)]">
                <span className="text-xs text-[var(--muted-foreground)] capitalize">{link.access_type}</span>
                <span className="text-xs text-[var(--muted-foreground)] truncate flex-1 font-mono">
                  ...{link.token.slice(-8)}
                </span>
                <button
                  onClick={() => copyLink(link.token)}
                  className="p-1 hover:bg-[var(--accent)] rounded"
                >
                  {copied === link.token ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => deleteLink(link.id)}
                  className="text-xs text-[var(--destructive)] hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-[var(--n-radius-md)] text-sm hover:bg-[var(--accent)]">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
