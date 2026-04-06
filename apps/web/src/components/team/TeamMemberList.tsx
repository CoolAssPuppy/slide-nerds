'use client'

import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

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
  const router = useRouter()

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


  if (teammates.length === 0) {
    return (
      <div className="mb-8 text-center py-12 rounded-[var(--n-radius-lg)] border border-dashed border-[var(--border)]">
        <p className="text-[var(--muted-foreground)] mb-2">No teammates yet</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          Invite someone to share decks, brands, and analytics.
        </p>
      </div>
    )
  }

  return (
    <>
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
    </>
  )
}
