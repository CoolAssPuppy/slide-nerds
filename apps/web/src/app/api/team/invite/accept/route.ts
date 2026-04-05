import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const acceptSchema = z.object({
  token: z.string().min(1),
  decline: z.boolean().optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = acceptSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { token, decline } = parsed.data

  // Look up the invite
  const { data: invite } = await supabase
    .from('team_invites')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (!invite) {
    return NextResponse.json({ error: 'Invite not found or already used.' }, { status: 404 })
  }

  if (new Date(invite.expires_at) < new Date()) {
    await supabase
      .from('team_invites')
      .update({ status: 'expired' })
      .eq('id', invite.id)
    return NextResponse.json({ error: 'This invite has expired.' }, { status: 410 })
  }

  // Verify the email matches the logged-in user
  if (invite.email.toLowerCase() !== user.email?.toLowerCase()) {
    return NextResponse.json(
      { error: `This invite is for ${invite.email}. Log in with that email to accept.` },
      { status: 403 }
    )
  }

  if (decline) {
    await supabase
      .from('team_invites')
      .update({ status: 'declined' })
      .eq('id', invite.id)
    return NextResponse.json({ declined: true })
  }

  // Accept: add user to team
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: invite.team_id,
      user_id: user.id,
      role: invite.role,
    })

  if (memberError) {
    if (memberError.code === '23505') {
      // Already a member
      await supabase.from('team_invites').update({ status: 'accepted' }).eq('id', invite.id)
      return NextResponse.json({ accepted: true, message: 'You are already a member of this team.' })
    }
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  // Mark invite as accepted
  await supabase
    .from('team_invites')
    .update({ status: 'accepted' })
    .eq('id', invite.id)

  return NextResponse.json({ accepted: true })
}
