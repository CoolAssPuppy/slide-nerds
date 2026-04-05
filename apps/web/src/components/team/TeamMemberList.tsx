'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Trash2, Crown, Shield, User } from 'lucide-react'

type Member = {
  user_id: string
  role: string
  created_at: string
  profiles: {
    display_name: string | null
    avatar_url: string | null
    first_name: string | null
    last_name: string | null
  } | null
}

type TeamMemberListProps = {
  teamId: string
  members: Member[]
  canManage: boolean
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <Crown className="w-3.5 h-3.5 text-yellow-500" />,
  admin: <Shield className="w-3.5 h-3.5 text-blue-500" />,
  member: <User className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />,
}

export function TeamMemberList({ teamId, members, canManage }: TeamMemberListProps) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    setError('')
    setSuccess('')

    const resp = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        team_id: teamId,
        email: inviteEmail.trim(),
        role: inviteRole,
      }),
    })

    if (resp.ok) {
      setSuccess(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      router.refresh()
    } else {
      const data = await resp.json()
      setError(data.error ?? 'Failed to send invite')
    }
    setInviting(false)
  }

  const handleRemove = async (userId: string) => {
    const resp = await fetch('/api/team/members', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: teamId, user_id: userId }),
    })

    if (resp.ok) router.refresh()
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    await fetch('/api/team/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_id: teamId, user_id: userId, role: newRole }),
    })
    router.refresh()
  }

  const inputClass = 'h-9 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {members.map((member) => {
          const name = member.profiles?.display_name
            ?? [member.profiles?.first_name, member.profiles?.last_name].filter(Boolean).join(' ')
            ?? 'Unknown'

          return (
            <div key={member.user_id} className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-medium shrink-0">
                {member.profiles?.avatar_url ? (
                  <img src={member.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  name[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{name}</div>
              </div>
              <div className="flex items-center gap-1.5">
                {ROLE_ICONS[member.role]}
                {canManage && member.role !== 'owner' ? (
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                    className="text-xs bg-transparent border-none text-[var(--muted-foreground)] cursor-pointer"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                ) : (
                  <span className="text-xs text-[var(--muted-foreground)] capitalize">{member.role}</span>
                )}
              </div>
              {canManage && member.role !== 'owner' && (
                <button
                  onClick={() => handleRemove(member.user_id)}
                  className="p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {canManage && (
        <div className="pt-3 border-t border-[var(--border)]">
          <div className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@company.com"
              className={`${inputClass} flex-1`}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin')}
              className={`${inputClass} w-24`}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
              className="flex items-center gap-1.5 px-3 h-9 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {inviting ? 'Sending...' : 'Invite'}
            </button>
          </div>
          {error && <p className="text-xs text-[var(--destructive)] mt-2">{error}</p>}
          {success && <p className="text-xs text-[var(--primary)] mt-2">{success}</p>}
        </div>
      )}
    </div>
  )
}
