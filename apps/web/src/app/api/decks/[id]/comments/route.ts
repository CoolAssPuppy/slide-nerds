import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

type RouteContext = {
  params: Promise<{ id: string }>
}

const commentSchema = z.object({
  slide_index: z.number().int().min(0).optional(),
  author_email: z.string().email(),
  author_name: z.string().optional(),
  content: z.string().min(1).max(2000),
})

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createClient()

  const { data: comments } = await supabase
    .from('deck_comments')
    .select('*')
    .eq('deck_id', id)
    .order('created_at', { ascending: false })
    .limit(100)

  return NextResponse.json(comments ?? [])
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params
  const body = await request.json()
  const parsed = commentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: comment, error } = await supabase
    .from('deck_comments')
    .insert({
      deck_id: id,
      ...parsed.data,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(comment, { status: 201 })
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: deck } = await supabase
    .from('decks')
    .select('id, owner_id')
    .eq('id', id)
    .single()

  if (!deck || deck.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const commentId = searchParams.get('commentId')
  if (!commentId) return NextResponse.json({ error: 'Missing commentId' }, { status: 400 })

  await supabase
    .from('deck_comments')
    .delete()
    .eq('id', commentId)
    .eq('deck_id', id)

  return NextResponse.json({ deleted: true })
}
