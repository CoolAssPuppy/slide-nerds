import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { createHash } from 'crypto'

type RouteContext = {
  params: Promise<{ sessionId: string }>
}

export async function POST(request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()

  const body = await request.json()
  const { word, slide_index } = body as { word: string; slide_index?: number }

  if (!word || word.trim().length === 0) {
    return NextResponse.json({ error: 'Word required' }, { status: 400 })
  }

  if (word.trim().length > 50) {
    return NextResponse.json({ error: 'Word must be 50 characters or fewer' }, { status: 400 })
  }

  const headersList = await headers()
  const forwarded = headersList.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  const voterHash = createHash('sha256')
    .update(ip + sessionId + (slide_index ?? 0))
    .digest('hex')
    .slice(0, 32)

  const { error } = await supabase
    .from('word_cloud_entries')
    .insert({
      session_id: sessionId,
      word: word.trim().toLowerCase(),
      slide_index: slide_index ?? 0,
      voter_hash: voterHash,
    })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { sessionId } = await params
  const supabase = await createClient()

  const slideIndex = new URL(_request.url).searchParams.get('slide_index')

  let query = supabase
    .from('word_cloud_entries')
    .select('word')
    .eq('session_id', sessionId)

  if (slideIndex !== null) {
    query = query.eq('slide_index', parseInt(slideIndex, 10))
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const wordCounts = new Map<string, number>()
  for (const entry of data ?? []) {
    wordCounts.set(entry.word, (wordCounts.get(entry.word) ?? 0) + 1)
  }

  const words = Array.from(wordCounts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json(words)
}
