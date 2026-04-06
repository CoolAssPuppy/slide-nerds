import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AcceptInvite } from '@/components/team/AcceptInvite'

type PageProps = {
  searchParams: Promise<{ token?: string }>
}

export const metadata = { title: 'Team invite' }

export default async function InvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams

  if (!token) redirect('/team')

  const supabase = await createClient()
  await supabase.auth.getUser()

  // Look up the invite
  const { data: invite } = await supabase
    .from('team_invites')
    .select('*, teams(name)')
    .eq('token', token)
    .single()

  if (!invite || invite.status !== 'pending') {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Invalid invite</h1>
        <p className="text-[var(--muted-foreground)]">
          This invitation link is invalid or has already been used.
        </p>
      </div>
    )
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Invite expired</h1>
        <p className="text-[var(--muted-foreground)]">
          This invitation has expired. Ask the team admin to send a new one.
        </p>
      </div>
    )
  }

  const teamName = (invite as Record<string, unknown>).teams as { name: string } | null

  // Get inviter's name
  const { data: inviterProfile } = await supabase
    .from('profiles')
    .select('display_name, first_name, last_name')
    .eq('id', invite.invited_by)
    .single()

  const inviterName =
    inviterProfile?.display_name
    ?? [inviterProfile?.first_name, inviterProfile?.last_name].filter(Boolean).join(' ')
    ?? 'Someone'

  return (
    <div className="max-w-md mx-auto mt-20">
      <AcceptInvite
        inviteId={invite.id}
        teamName={teamName?.name ?? 'a team'}
        inviterName={inviterName}
        role={invite.role}
        token={token}
      />
    </div>
  )
}
