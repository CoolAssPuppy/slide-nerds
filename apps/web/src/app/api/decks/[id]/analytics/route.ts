import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { getIpHash } from '@/lib/ip-hash'
import { z } from 'zod'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('deck_views')
    .select('*')
    .eq('deck_id', id)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

const AnalyticsPayloadSchema = z.object({
  slide_index: z.number().int().min(0).max(5000),
  dwell_seconds: z.number().min(0).max(28800),
  share_link_id: z.string().optional(),
})

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  let body: z.infer<typeof AnalyticsPayloadSchema>
  try {
    const raw = await request.json()
    body = AnalyticsPayloadSchema.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { slide_index, dwell_seconds, share_link_id } = body

  const ipHash = getIpHash(request, 16)
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || undefined

  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('deck_views')
    .insert({
      deck_id: id,
      viewer_id: user?.id || null,
      slide_index,
      dwell_seconds: dwell_seconds || 0,
      share_link_id: share_link_id || null,
      ip_hash: ipHash,
      user_agent: userAgent,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
