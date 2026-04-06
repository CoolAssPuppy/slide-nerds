'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, X } from 'lucide-react'

type TeamPageHeaderProps = {
  teamId: string
}

export function TeamPageHeader({ teamId }: TeamPageHeaderProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    setError('')

    const resp = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id: teamId,
        email: inviteEmail.trim(),
        role: 'member',
      }),
    })

    if (resp.ok) {
      setInviteEmail('')
      setShowDialog(false)
      router.refresh()
    } else {
      const data = await resp.json()
      setError(data.error ?? 'Failed to send invite')
    }
    setInviting(false)
  }

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Everyone you&apos;re collaborating with on slides.
          </p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <UserPlus size={16} />
          Invite teammate
        </button>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowDialog(false); setError('') }} />
          <div className="relative w-full max-w-sm rounded-[var(--n-radius-xl)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invite teammate</h3>
              <button onClick={() => { setShowDialog(false); setError('') }} className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <label className="block text-sm text-[var(--muted-foreground)] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              className="h-9 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] w-full"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleInvite() }}
            />
            {error && <p className="text-xs text-[var(--destructive)] mt-2">{error}</p>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setShowDialog(false); setError('') }}
                className="px-4 py-2 rounded-[var(--n-radius-md)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)]"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                className="px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {inviting ? 'Sending...' : 'Send invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
