import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { getUserPlan } from '@/lib/tier'

const createDomainSchema = z.object({
  domain: z.string().min(3).regex(/^[a-z0-9.-]+\.[a-z]{2,}$/i, 'Invalid domain format'),
  deck_id: z.string().uuid(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: domains } = await supabase
    .from('custom_domains')
    .select('*')
    .or(`deck_id.in.(select id from decks where owner_id.eq.${user.id})`)

  return NextResponse.json(domains ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only Team plan can use custom domains
  const plan = await getUserPlan(supabase, user.id)
  if (plan !== 'team') {
    return NextResponse.json(
      { error: 'Custom domains require the Team plan.' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const parsed = createDomainSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { domain, deck_id } = parsed.data

  // Verify deck ownership
  const { data: deck } = await supabase
    .from('decks')
    .select('id, owner_id')
    .eq('id', deck_id)
    .single()

  if (!deck || deck.owner_id !== user.id) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
  }

  const { data: customDomain, error } = await supabase
    .from('custom_domains')
    .insert({ domain: domain.toLowerCase(), deck_id })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This domain is already registered.' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(customDomain)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await supabase.from('custom_domains').delete().eq('id', id)

  return NextResponse.json({ deleted: true })
}
