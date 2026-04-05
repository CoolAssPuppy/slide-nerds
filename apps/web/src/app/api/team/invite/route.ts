import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const inviteSchema = z.object({
  team_id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = inviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { team_id, email, role } = parsed.data

  // Verify the user is an owner or admin of the team
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', team_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Only team owners and admins can invite members.' }, { status: 403 })
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('team_members')
    .select('user_id')
    .eq('team_id', team_id)
    .eq('user_id', (await supabase.from('profiles').select('id').ilike('display_name', email).single()).data?.id ?? '')
    .single()

  if (existingMember) {
    return NextResponse.json({ error: 'This user is already a team member.' }, { status: 409 })
  }

  // Create the invite
  const { data: invite, error } = await supabase
    .from('team_invites')
    .insert({
      team_id,
      email: email.toLowerCase(),
      role,
      invited_by: user.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An invite has already been sent to this email.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // In production, send an email with the invite link
  // For now, the invite is created and can be accepted via the accept endpoint
  return NextResponse.json(invite)
}
