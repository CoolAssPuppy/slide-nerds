'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type AcceptInviteProps = {
  inviteId: string
  teamName: string
  role: string
  token: string
}

export function AcceptInvite({ teamName, role, token }: AcceptInviteProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAccept = async () => {
    setLoading(true)
    setError('')

    const resp = await fetch('/api/team/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (resp.ok) {
      router.push('/team')
    } else {
      const data = await resp.json()
      setError(data.error ?? 'Failed to accept invite')
      setLoading(false)
    }
  }

  const handleDecline = async () => {
    setLoading(true)
    await fetch('/api/team/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, decline: true }),
    })
    router.push('/slides')
  }

  return (
    <div className="rounded-[var(--n-radius-xl)] border border-[var(--border)] bg-[var(--card)] p-8 text-center">
      <h1 className="text-2xl font-bold mb-2">You have been invited</h1>
      <p className="text-[var(--muted-foreground)] mb-6">
        Join <strong>{teamName}</strong> as a <strong>{role}</strong>.
      </p>

      {error && <p className="text-sm text-[var(--destructive)] mb-4">{error}</p>}

      <div className="flex justify-center gap-3">
        <button
          onClick={handleDecline}
          disabled={loading}
          className="px-6 py-2.5 rounded-[var(--n-radius-md)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)] disabled:opacity-50"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="px-6 py-2.5 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Joining...' : 'Accept invite'}
        </button>
      </div>
    </div>
  )
}
