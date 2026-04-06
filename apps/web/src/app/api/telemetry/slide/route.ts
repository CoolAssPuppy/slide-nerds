import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { getTelemetrySecret, verifyTelemetryToken } from '@/lib/telemetry-token'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

type TelemetryPayload = {
  deck_id: string
  slide_index: number
  dwell_seconds?: number
  telemetry_token: string
}

const badRequest = (message: string) => {
  return NextResponse.json({ error: message }, { status: 400, headers: CORS_HEADERS })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  let body: TelemetryPayload
  try {
    body = await request.json() as TelemetryPayload
  } catch {
    return badRequest('Invalid JSON payload')
  }

  if (!body.deck_id || typeof body.deck_id !== 'string') {
    return badRequest('deck_id is required')
  }

  if (typeof body.slide_index !== 'number' || body.slide_index < 0 || body.slide_index > 5000) {
    return badRequest('slide_index must be a number between 0 and 5000')
  }

  if (!body.telemetry_token || typeof body.telemetry_token !== 'string') {
    return badRequest('telemetry_token is required')
  }

  const dwellSeconds = Number.isFinite(body.dwell_seconds)
    ? Math.max(0, Math.min(Math.floor(body.dwell_seconds ?? 0), 60 * 60 * 8))
    : 0

  let tokenPayload
  try {
    tokenPayload = verifyTelemetryToken(body.telemetry_token, getTelemetrySecret())
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to verify telemetry token'
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS })
  }

  if (!tokenPayload) {
    return NextResponse.json({ error: 'Invalid telemetry token' }, { status: 401, headers: CORS_HEADERS })
  }

  if (tokenPayload.deckId !== body.deck_id) {
    return NextResponse.json({ error: 'Telemetry token/deck mismatch' }, { status: 403, headers: CORS_HEADERS })
  }

  const headersList = request.headers
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16)
  const userAgent = headersList.get('user-agent') || null

  const supabase = await createClient()
  const { error } = await supabase
    .from('deck_views')
    .insert({
      deck_id: body.deck_id,
      slide_index: Math.floor(body.slide_index),
      dwell_seconds: dwellSeconds,
      ip_hash: ipHash,
      user_agent: userAgent,
      viewer_id: null,
      share_link_id: null,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: CORS_HEADERS })
  }

  return NextResponse.json({ ok: true }, { status: 201, headers: CORS_HEADERS })
}
