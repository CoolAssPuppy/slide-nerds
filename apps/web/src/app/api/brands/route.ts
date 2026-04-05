import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import type { Json } from '@/lib/supabase/database.types'

export async function GET(request: Request) {
  const { supabase, user } = await createApiClient(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const name = url.searchParams.get('name')

  let query = supabase
    .from('brand_configs')
    .select('*')
    .order('updated_at', { ascending: false })

  if (name) {
    query = query.eq('name', name)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { supabase, user } = await createApiClient(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, config, team_id } = body as {
    name: string
    config: Json
    team_id?: string
  }

  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  if (!config) {
    return NextResponse.json({ error: 'Config is required' }, { status: 400 })
  }

  const insertPayload = team_id
    ? { name: name.trim(), config, team_id }
    : { name: name.trim(), config, owner_id: user.id }

  const { data, error } = await supabase
    .from('brand_configs')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
