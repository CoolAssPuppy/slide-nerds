'use client'

import { useState } from 'react'
import type { ShareLink } from '@/lib/supabase/types'

type AccessGateProps = {
  shareLink: ShareLink
  deckName: string
  children: React.ReactNode
}

export function AccessGate({ shareLink, deckName, children }: AccessGateProps) {
  const [granted, setGranted] = useState(false)
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (granted) {
    return <>{children}</>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const resp = await fetch('/api/share/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: shareLink.token,
          value: value.trim(),
          type: shareLink.access_type,
        }),
      })

      if (resp.ok) {
        setGranted(true)
      } else {
        const data = await resp.json()
        setError(data.error ?? 'Access denied')
      }
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">{deckName}</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          {shareLink.access_type === 'password' && 'This presentation is password-protected.'}
          {shareLink.access_type === 'email' && 'Enter your email to access this presentation.'}
          {shareLink.access_type === 'domain' && 'Enter your work email to access this presentation.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type={shareLink.access_type === 'password' ? 'password' : 'email'}
            placeholder={shareLink.access_type === 'password' ? 'Enter password' : 'you@company.com'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputClass}
            required
          />

          {error && (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="w-full h-10 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Checking...' : 'View presentation'}
          </button>
        </form>
      </div>
    </div>
  )
}
