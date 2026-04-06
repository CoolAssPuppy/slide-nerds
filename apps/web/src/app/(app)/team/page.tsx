import { createClient } from '@/lib/supabase/server'
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
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, first_name, last_name')
      .eq('id', user!.id)
      .single()

    const displayName = profile?.display_name
      ?? [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
      ?? 'My Team'
    const slug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-team'

    const { data: newTeam } = await supabase
      .from('teams')
      .insert({ name: `${displayName}'s Team`, slug: `${slug}-${Date.now()}`, owner_id: user!.id })
      .select()
      .single()

    if (newTeam) {
      await supabase
        .from('team_members')
        .insert({ team_id: newTeam.id, user_id: user!.id, role: 'owner' })

      return (
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Team</h1>
          </div>
          <TeamMemberList teamId={newTeam.id} teammates={[]} canManage={true} />
        </div>
      )
    }

    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-8">Team</h1>
        <p className="text-[var(--muted-foreground)]">Something went wrong. Please try again.</p>
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
