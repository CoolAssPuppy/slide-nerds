import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params
  const { supabase, user } = await createApiClient(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  const { supabase, user } = await createApiClient(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const allowed = ['name', 'description', 'slug', 'url', 'deployed_url', 'is_public', 'slide_count', 'thumbnail_url']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key]
    }
  }

  const { data, error } = await supabase
    .from('decks')
    .update(updates)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params
  const { supabase, user } = await createApiClient(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('decks')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
