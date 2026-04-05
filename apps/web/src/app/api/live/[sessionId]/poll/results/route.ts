import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()

  const { data: polls, error: pollsError } = await supabase
    .from('polls')
    .select('id, question, options, is_active, slide_index')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (pollsError) {
    return NextResponse.json({ error: pollsError.message }, { status: 500 })
  }

  if (!polls || polls.length === 0) {
    return NextResponse.json([])
  }

  const pollIds = polls.map((p) => p.id)

  const { data: votes, error: votesError } = await supabase
    .from('poll_votes')
    .select('poll_id, option_index')
    .in('poll_id', pollIds)

  if (votesError) {
    return NextResponse.json({ error: votesError.message }, { status: 500 })
  }

  const voteCounts = new Map<string, Map<number, number>>()
  for (const vote of votes ?? []) {
    const pollMap = voteCounts.get(vote.poll_id) ?? new Map<number, number>()
    pollMap.set(vote.option_index, (pollMap.get(vote.option_index) ?? 0) + 1)
    voteCounts.set(vote.poll_id, pollMap)
  }

  const results = polls.map((poll) => {
    const options = typeof poll.options === 'string' ? JSON.parse(poll.options) : poll.options
    const pollVotes = voteCounts.get(poll.id) ?? new Map<number, number>()
    const totalVotes = Array.from(pollVotes.values()).reduce((sum, count) => sum + count, 0)

    return {
      id: poll.id,
      question: poll.question,
      slide_index: poll.slide_index,
      is_active: poll.is_active,
      total_votes: totalVotes,
      options: (options as string[]).map((label: string, index: number) => ({
        label,
        index,
        votes: pollVotes.get(index) ?? 0,
      })),
    }
  })

  return NextResponse.json(results)
}
