import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Team' }

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: memberships } = await supabase
    .from('team_members')
    .select('team_id, role, teams(name, slug)')
    .eq('user_id', user!.id)

  const teams = (memberships ?? []) as Array<{
    team_id: string
    role: string
    teams: { name: string; slug: string } | null
  }>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Team</h1>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-[var(--muted-foreground)]">You are not part of any team yet.</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Teams are available on the Pro and Team plans.
          </p>
          <Link
            href="/pricing"
            className="inline-block mt-4 px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium"
          >
            View plans
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map((tm) => (
            <Link
              key={tm.team_id}
              href={`/team/members`}
              className="block rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--primary)] transition-colors"
            >
              <h3 className="font-semibold">{tm.teams?.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Role: {tm.role} &middot; {tm.teams?.slug}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
