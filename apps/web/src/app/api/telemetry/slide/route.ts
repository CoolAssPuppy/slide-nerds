import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getIpHash } from '@/lib/ip-hash'
import { getTelemetrySecret, verifyTelemetryToken } from '@/lib/telemetry-token'
import { z } from 'zod'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const MAX_DWELL_SECONDS = 60 * 60 * 8

const TelemetryPayloadSchema = z.object({
  deck_id: z.string().min(1),
  slide_index: z.number().int().min(0).max(5000),
  dwell_seconds: z.number().min(0).max(MAX_DWELL_SECONDS).optional(),
  telemetry_token: z.string().min(1),
})

const badRequest = (message: string) => {
  return NextResponse.json({ error: message }, { status: 400, headers: CORS_HEADERS })
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: Request) {
  let body: z.infer<typeof TelemetryPayloadSchema>
  try {
    const raw = await request.json()
    body = TelemetryPayloadSchema.parse(raw)
  } catch {
    return badRequest('Invalid payload')
  }

  const dwellSeconds = Math.floor(body.dwell_seconds ?? 0)

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

  const ipHash = getIpHash(request, 16)
  const userAgent = request.headers.get('user-agent') || null

  const supabase = await createClient()
  const { error } = await supabase
    .from('deck_views')
    .insert({
      deck_id: body.deck_id,
      slide_index: body.slide_index,
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
