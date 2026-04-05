import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

const VALID_REACTION_TYPES = ['thumbsup', 'clap', 'heart', 'fire', 'mind_blown'] as const

export async function POST(request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()

  const body = await request.json()
  const { type } = body as { type: string }

  if (!type || !VALID_REACTION_TYPES.includes(type as typeof VALID_REACTION_TYPES[number])) {
    return NextResponse.json(
      { error: `Invalid reaction type. Must be one of: ${VALID_REACTION_TYPES.join(', ')}` },
      { status: 400 },
    )
  }

  const { error } = await supabase
    .from('reactions')
    .insert({
      session_id: sessionId,
      type,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()

  const since = new URL(_request.url).searchParams.get('since')

  let query = supabase
    .from('reactions')
    .select('id, type, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (since) {
    query = query.gt('created_at', since)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
