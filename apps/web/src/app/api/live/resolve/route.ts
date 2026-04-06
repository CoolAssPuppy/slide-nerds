import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deckId = searchParams.get('deck_id')
  const name = searchParams.get('name')

  if (!deckId || !name) {
    return NextResponse.json({ error: 'deck_id and name are required' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('live_sessions')
    .select('id')
    .eq('deck_id', deckId)
    .eq('name', name)
    .eq('status', 'active')
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'No active session found' }, { status: 404 })
  }

  return NextResponse.json({ session_id: data.id })
}
