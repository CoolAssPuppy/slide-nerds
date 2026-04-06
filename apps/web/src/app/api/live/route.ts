import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateSessionSchema = z.object({
  deck_id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof CreateSessionSchema>
  try {
    const raw = await request.json()
    body = CreateSessionSchema.parse(raw)
  } catch {
    return NextResponse.json({ error: 'deck_id required' }, { status: 400 })
  }

  const { deck_id } = body

  const { data, error } = await supabase
    .from('live_sessions')
    .insert({
      deck_id,
      presenter_id: user.id,
      name: body.name ?? null,
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
