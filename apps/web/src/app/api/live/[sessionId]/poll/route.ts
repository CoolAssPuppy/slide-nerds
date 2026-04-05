import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function POST(request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { question, options, slide_index } = body as {
    question: string
    options: string[]
    slide_index?: number
  }

  if (!question || !options || options.length < 2) {
    return NextResponse.json({ error: 'Question and at least 2 options required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('polls')
    .insert({
      session_id: sessionId,
      question,
      options: JSON.stringify(options),
      slide_index: slide_index ?? 0,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { poll_id, is_active } = body as { poll_id: string; is_active: boolean }

  const { error } = await supabase
    .from('polls')
    .update({ is_active })
    .eq('id', poll_id)
    .eq('session_id', sessionId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
