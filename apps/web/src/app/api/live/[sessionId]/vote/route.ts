import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getVoterHash } from '@/lib/ip-hash'

export async function POST(request: Request) {
  const supabase = await createClient()

  const body = await request.json()
  const { poll_id, option_index } = body as { poll_id: string; option_index: number }

  if (!poll_id || option_index === undefined) {
    return NextResponse.json({ error: 'poll_id and option_index required' }, { status: 400 })
  }

  const voterHash = getVoterHash(request, poll_id)

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
