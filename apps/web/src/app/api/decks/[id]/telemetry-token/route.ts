import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { createTelemetryToken, getTelemetrySecret } from '@/lib/telemetry-token'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id: deckId } = await params
  const { supabase, user } = await createApiClient(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: deck, error: deckError } = await supabase
    .from('decks')
    .select('id, owner_id')
    .eq('id', deckId)
    .single()

  if (deckError || !deck) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
  }

  if (deck.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const token = createTelemetryToken(deck.id, user.id, getTelemetrySecret())
    return NextResponse.json({ token }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to issue token'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
