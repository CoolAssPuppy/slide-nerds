import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { createHash } from 'crypto'

export async function POST(request: Request) {
  const supabase = await createClient()

  const body = await request.json()
  const { poll_id, option_index } = body as { poll_id: string; option_index: number }

  if (!poll_id || option_index === undefined) {
    return NextResponse.json({ error: 'poll_id and option_index required' }, { status: 400 })
  }

  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  const voterHash = createHash('sha256').update(ip + poll_id).digest('hex').slice(0, 32)

  const { error } = await supabase
    .from('poll_votes')
    .insert({
      poll_id,
      voter_hash: voterHash,
      option_index,
    })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already voted' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
