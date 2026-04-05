import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function POST(request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()

  const body = await request.json()
  const { content, author_name, slide_index } = body as {
    content: string
    author_name?: string
    slide_index?: number
  }

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: 'Question content required' }, { status: 400 })
  }

  if (content.length > 500) {
    return NextResponse.json({ error: 'Question must be 500 characters or fewer' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('qa_questions')
    .insert({
      session_id: sessionId,
      content: content.trim(),
      author_name: author_name?.trim() || null,
      slide_index: slide_index ?? 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('qa_questions')
    .select('id, content, author_name, is_answered, slide_index, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { question_id, is_answered } = body as { question_id: string; is_answered: boolean }

  if (!question_id || is_answered === undefined) {
    return NextResponse.json({ error: 'question_id and is_answered required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('qa_questions')
    .update({ is_answered })
    .eq('id', question_id)
    .eq('session_id', sessionId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
