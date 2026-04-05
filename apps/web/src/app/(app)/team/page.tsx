import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DeckGrid } from '@/components/slides/DeckGrid'
import { TeamMemberList } from '@/components/team/TeamMemberList'
import type { Deck } from '@/lib/supabase/types'

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

  // Get team decks
  const { data: deckData } = await supabase
    .from('decks')
    .select('*')
    .eq('team_id', teamId)
    .order('updated_at', { ascending: false })
  const teamDecks = (deckData ?? []) as Deck[]

  // Get team members
  const { data: memberData } = await supabase
    .from('team_members')
    .select('user_id, role, created_at')
    .eq('team_id', teamId)

  const memberRows = (memberData ?? []) as Array<{
    user_id: string
    role: string
    created_at: string
  }>

  // Fetch profiles for each member
  const memberIds = memberRows.map(m => m.user_id)
  const { data: profileData } = memberIds.length > 0
    ? await supabase.from('profiles').select('id, display_name, avatar_url, first_name, last_name').in('id', memberIds)
    : { data: [] }
  const profileMap = new Map((profileData ?? []).map(p => [p.id, p]))

  const members = memberRows.map(m => ({
    ...m,
    profiles: profileMap.get(m.user_id) ?? null,
  }))

  const isOwnerOrAdmin = team.role === 'owner' || team.role === 'admin'

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{team.teams?.name ?? 'Team'}</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            Team decks
          </h2>
          {teamDecks.length > 0 ? (
            <DeckGrid decks={teamDecks} />
          ) : (
            <div className="rounded-[var(--n-radius-lg)] border border-dashed border-[var(--border)] p-8 text-center">
              <p className="text-sm text-[var(--muted-foreground)]">
                No team decks yet. Assign a deck to this team from its settings page.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            Members
          </h2>
          <TeamMemberList
            teamId={teamId}
            members={members}
            canManage={isOwnerOrAdmin}
          />
        </section>
      </div>
    </div>
  )
}
