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
    .from('brand_configs')
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

  const { data: config } = await supabase
    .from('brand_configs')
    .select('id, owner_id')
    .eq('id', id)
    .single()

  if (!config || config.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const allowed = ['name', 'config']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key]
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('brand_configs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params
  const { supabase, user } = await createApiClient(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: config } = await supabase
    .from('brand_configs')
    .select('id, owner_id')
    .eq('id', id)
    .single()

  if (!config || config.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await supabase
    .from('brand_configs')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
