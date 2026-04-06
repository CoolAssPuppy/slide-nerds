import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TeamMemberList } from '@/components/team/TeamMemberList'

export const metadata = { title: 'Team' }

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's team memberships
  const { data: memberships } = await supabase
    .from('team_members')
    .select('team_id, role, teams(id, name, slug)')
    .eq('user_id', user!.id)

  const teams = (memberships ?? []) as Array<{
    team_id: string
    role: string
    teams: { id: string; name: string; slug: string } | null
  }>

  if (teams.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-8">Team</h1>
        <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-[var(--muted-foreground)]">You are not part of any team yet.</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Teams are available on the Team plan.
          </p>
          <Link
            href="/account"
            className="inline-block mt-4 px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium"
          >
            Upgrade plan
          </Link>
        </div>
      </div>
    )
  }

  const team = teams[0]
  const teamId = team.team_id
  const isOwnerOrAdmin = team.role === 'owner' || team.role === 'admin'

  // Get invites for this team
  const { data: inviteData } = await supabase
    .from('team_invites')
    .select('id, email, status, created_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })

  // Get accepted members (from team_members, excluding the current user)
  const { data: memberData } = await supabase
    .from('team_members')
    .select('user_id, created_at')
    .eq('team_id', teamId)
    .neq('user_id', user!.id)

  const memberRows = memberData ?? []
  const memberIds = memberRows.map(m => m.user_id)

  // Get emails for members via auth lookup in profiles
  const { data: profileData } = memberIds.length > 0
    ? await supabase.from('profiles').select('id, display_name, first_name, last_name').in('id', memberIds)
    : { data: [] }

  const profileMap = new Map((profileData ?? []).map(p => [p.id, p]))

  // Build a unified teammate list from invites
  // Invites already track the full lifecycle (pending, accepted, declined)
  const teammates = (inviteData ?? []).map(inv => ({
    id: inv.id,
    email: inv.email,
    status: inv.status as 'pending' | 'accepted' | 'declined',
    created_at: inv.created_at,
    type: 'invite' as 'invite' | 'member',
    user_id: undefined as string | undefined,
  }))

  // For accepted members who might not have a matching invite (e.g., owners),
  // add them if they are not already in the invite list
  const inviteEmails = new Set(teammates.map(t => t.email.toLowerCase()))
  for (const member of memberRows) {
    const profile = profileMap.get(member.user_id)
    const displayName = profile?.display_name
      ?? [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
      ?? member.user_id

    if (!inviteEmails.has(displayName.toLowerCase())) {
      teammates.push({
        id: member.user_id,
        email: displayName,
        status: 'accepted',
        created_at: member.created_at,
        type: 'member',
        user_id: member.user_id,
      })
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">{team.teams?.name ?? 'Team'}</h1>
      </div>

      <TeamMemberList
        teamId={teamId}
        teammates={teammates}
        canManage={isOwnerOrAdmin}
      />
    </div>
  )
}
