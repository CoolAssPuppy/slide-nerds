import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('live_sessions')
    .select('audience_count, status')
    .eq('id', sessionId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 })
  }

  return NextResponse.json({
    count: data.audience_count ?? 0,
    status: data.status,
  })
}

export async function POST(request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()

  const body = await request.json()
  const { action } = body as { action: 'join' | 'leave' }

  if (action !== 'join' && action !== 'leave') {
    return NextResponse.json({ error: 'action must be join or leave' }, { status: 400 })
  }

  const increment = action === 'join' ? 1 : -1

  const { error } = await supabase.rpc('increment_audience_count', {
    p_session_id: sessionId,
    p_increment: increment,
  })

  if (error) {
    const { error: fallbackError } = await supabase
      .from('live_sessions')
      .update({
        audience_count: Math.max(0, increment > 0 ? 1 : 0),
      })
      .eq('id', sessionId)
      .eq('status', 'active')

    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
