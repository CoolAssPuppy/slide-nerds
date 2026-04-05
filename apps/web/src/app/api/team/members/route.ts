import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const deleteSchema = z.object({
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
})

const patchSchema = z.object({
  team_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'member']),
})

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { team_id, user_id: targetUserId } = parsed.data

  // Verify requester is owner/admin
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', team_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    // Allow users to remove themselves
    if (targetUserId !== user.id) {
      return NextResponse.json({ error: 'Only team owners and admins can remove members.' }, { status: 403 })
    }
  }

  // Cannot remove the owner
  const { data: target } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', team_id)
    .eq('user_id', targetUserId)
    .single()

  if (target?.role === 'owner') {
    return NextResponse.json({ error: 'Cannot remove the team owner.' }, { status: 403 })
  }

  await supabase
    .from('team_members')
    .delete()
    .eq('team_id', team_id)
    .eq('user_id', targetUserId)

  return NextResponse.json({ removed: true })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { team_id, user_id: targetUserId, role } = parsed.data

  // Verify requester is owner/admin
  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', team_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Only team owners and admins can change roles.' }, { status: 403 })
  }

  await supabase
    .from('team_members')
    .update({ role })
    .eq('team_id', team_id)
    .eq('user_id', targetUserId)

  return NextResponse.json({ updated: true })
}
