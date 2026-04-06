import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getVoterHash } from '@/lib/ip-hash'
import { z } from 'zod'

const VoteSchema = z.object({
  poll_id: z.string().min(1),
  option_index: z.number().int().min(0),
})

export async function POST(request: Request) {
  const supabase = await createClient()

  let body: z.infer<typeof VoteSchema>
  try {
    const raw = await request.json()
    body = VoteSchema.parse(raw)
  } catch {
    return NextResponse.json({ error: 'poll_id and option_index required' }, { status: 400 })
  }

  const { poll_id, option_index } = body

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
