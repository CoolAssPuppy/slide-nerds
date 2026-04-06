import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { slugify } from '@/lib/slugify'
import { z } from 'zod'

const CreateDeckSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  deployed_url: z.string().url().optional(),
  description: z.string().optional(),
  source_type: z.enum(['url', 'push']).optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

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

  let body: z.infer<typeof CreateDeckSchema>
  try {
    const raw = await request.json()
    body = CreateDeckSchema.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const { name, url, deployed_url, description } = body

  const slug = slugify(name)

  const { data, error } = await supabase
    .from('decks')
    .insert({
      name: name.trim(),
      slug,
      owner_id: user.id,
      url: url?.trim() || null,
      deployed_url: deployed_url?.trim() || url?.trim() || null,
      description: description?.trim() || null,
      source_type: 'url',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
