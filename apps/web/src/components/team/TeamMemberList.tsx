'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Trash2, X } from 'lucide-react'

type Teammate = {
  id: string
  email: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  type: 'invite' | 'member'
  user_id?: string
}

type TeamMemberListProps = {
  teamId: string
  teammates: Teammate[]
  canManage: boolean
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500',
    accepted: 'bg-[var(--primary)]/10 text-[var(--primary)]',
    declined: 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
  }

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? ''}`}>
      {status}
    </span>
  )
}

export function TeamMemberList({ teamId, teammates, canManage }: TeamMemberListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
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
      setIsDialogOpen(false)
      router.refresh()
    } else {
      const data = await resp.json()
      setError(data.error ?? 'Failed to send invite')
    }
    setInviting(false)
  }

  const handleDelete = async (teammate: Teammate) => {
    if (teammate.type === 'invite') {
      await fetch('/api/team/invite', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, invite_id: teammate.id }),
      })
    } else if (teammate.user_id) {
      await fetch('/api/team/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId, user_id: teammate.user_id }),
      })
    }
    router.refresh()
  }

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const inputClass =
    'h-9 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] w-full'

  if (teammates.length === 0 && canManage) {
    return (
      <>
        <div className="rounded-[var(--n-radius-lg)] border border-dashed border-[var(--border)] p-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            No teammates yet. Invite someone to get started.
          </p>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90"
          >
            <UserPlus className="w-4 h-4" />
            Invite teammate
          </button>
        </div>
        {isDialogOpen && (
          <InviteDialog
            inviteEmail={inviteEmail}
            setInviteEmail={setInviteEmail}
            inviting={inviting}
            error={error}
            onSubmit={handleInvite}
            onClose={() => { setIsDialogOpen(false); setError('') }}
            inputClass={inputClass}
          />
        )}
      </>
    )
  }

  return (
    <>
      {canManage && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90"
          >
            <UserPlus className="w-4 h-4" />
            Invite teammate
          </button>
        </div>
      )}
      <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                Date invited
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
                Status
              </th>
              {canManage && (
                <th className="w-10 px-4 py-3" />
              )}
            </tr>
          </thead>
          <tbody>
            {teammates.map((t) => (
              <tr key={t.id} className="border-b border-[var(--border)] last:border-b-0">
                <td className="px-4 py-3 font-medium">{t.email}</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">{formatDate(t.created_at)}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                {canManage && (
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(t)}
                      className="p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isDialogOpen && (
        <InviteDialog
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviting={inviting}
          error={error}
          onSubmit={handleInvite}
          onClose={() => { setIsDialogOpen(false); setError('') }}
          inputClass={inputClass}
        />
      )}
    </>
  )
}

type InviteDialogProps = {
  inviteEmail: string
  setInviteEmail: (email: string) => void
  inviting: boolean
  error: string
  onSubmit: () => void
  onClose: () => void
  inputClass: string
}

function InviteDialog({
  inviteEmail,
  setInviteEmail,
  inviting,
  error,
  onSubmit,
  onClose,
  inputClass,
}: InviteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-[var(--n-radius-xl)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Invite teammate</h3>
          <button onClick={onClose} className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
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
          className={inputClass}
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmit() }}
        />
        {error && <p className="text-xs text-[var(--destructive)] mt-2">{error}</p>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[var(--n-radius-md)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)]"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={inviting || !inviteEmail.trim()}
            className="px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {inviting ? 'Sending...' : 'Send invite'}
          </button>
        </div>
      </div>
    </div>
  )
}
