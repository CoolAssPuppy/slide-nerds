import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

type RouteContext = {
  params: Promise<{ id: string; sessionId: string }>
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id: deckId, sessionId } = await params
  const { supabase, user } = await createApiClient(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: deck } = await supabase
    .from('decks')
    .select('id, owner_id')
    .eq('id', deckId)
    .single()

  if (!deck || deck.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('live_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('deck_id', deckId)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
