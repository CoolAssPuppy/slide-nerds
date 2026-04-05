import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { createHash } from 'crypto'

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

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const body = await request.json()
  const { slide_index, dwell_seconds, share_link_id } = body as {
    slide_index: number
    dwell_seconds: number
    share_link_id?: string
  }

  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  const ipHash = createHash('sha256').update(ip).digest('hex').slice(0, 16)
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
