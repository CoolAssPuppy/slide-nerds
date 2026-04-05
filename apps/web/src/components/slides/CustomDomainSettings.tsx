'use client'

import { useState, useEffect } from 'react'
import { Globe, Check, AlertCircle, Trash2 } from 'lucide-react'
import type { CustomDomain } from '@/lib/supabase/types'

type CustomDomainSettingsProps = {
  deckId: string
}

export function CustomDomainSettings({ deckId }: CustomDomainSettingsProps) {
  const [domains, setDomains] = useState<CustomDomain[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [adding, setAdding] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const resp = await fetch('/api/domains')
      if (resp.ok) {
        const all = await resp.json()
        setDomains(all.filter((d: CustomDomain) => d.deck_id === deckId))
      }
    }
    load()
  }, [deckId])

  const handleAdd = async () => {
    if (!newDomain.trim()) return
    setAdding(true)
    setError('')

    const resp = await fetch('/api/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: newDomain.trim(), deck_id: deckId }),
    })

    const data = await resp.json()
    if (resp.ok) {
      setDomains([...domains, data])
      setNewDomain('')
    } else {
      setError(data.error)
    }
    setAdding(false)
  }

  const handleVerify = async (id: string) => {
    setVerifying(id)
    const resp = await fetch('/api/domains/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (resp.ok) {
      const result = await resp.json()
      if (result.verified) {
        setDomains(domains.map(d => d.id === id ? { ...d, is_verified: true, ssl_status: 'active' } : d))
      }
    }
    setVerifying(null)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/domains?id=${id}`, { method: 'DELETE' })
    setDomains(domains.filter(d => d.id !== id))
  }

  const inputClass = 'w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          placeholder="presentations.yourcompany.com"
          className={inputClass}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newDomain.trim()}
          className="px-4 h-10 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50 shrink-0"
        >
          {adding ? 'Adding...' : 'Add domain'}
        </button>
      </div>

      {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

      {domains.length > 0 && (
        <div className="space-y-2">
          {domains.map((domain) => (
            <div key={domain.id} className="flex items-center gap-3 p-3 rounded-[var(--n-radius-md)] border border-[var(--border)]">
              <Globe className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{domain.domain}</div>
                {!domain.is_verified && (
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    Add TXT record: <code className="text-[var(--primary)]">_slidenerds-verify.{domain.domain}</code> = <code className="text-[var(--primary)]">{domain.verification_token}</code>
                  </div>
                )}
              </div>

              {domain.is_verified ? (
                <span className="flex items-center gap-1 text-xs text-[var(--primary)]">
                  <Check className="w-3.5 h-3.5" /> Verified
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                    <AlertCircle className="w-3.5 h-3.5" /> Pending
                  </span>
                  <button
                    onClick={() => handleVerify(domain.id)}
                    disabled={verifying !== null}
                    className="text-xs text-[var(--primary)] hover:underline"
                  >
                    {verifying === domain.id ? 'Checking...' : 'Verify'}
                  </button>
                </>
              )}

              <button
                onClick={() => handleDelete(domain.id)}
                className="p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
