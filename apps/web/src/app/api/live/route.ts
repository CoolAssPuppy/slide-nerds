import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { deck_id } = body as { deck_id: string }

  if (!deck_id) {
    return NextResponse.json({ error: 'deck_id required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('live_sessions')
    .insert({
      deck_id,
      presenter_id: user.id,
      status: 'active',
      current_slide: 0,
      current_step: 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
