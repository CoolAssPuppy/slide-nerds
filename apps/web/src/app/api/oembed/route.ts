import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  // Extract slug from the URL
  const match = url.match(/\/d\/([a-z0-9-]+)/)
  if (!match) {
    return NextResponse.json({ error: 'Invalid SlideNerds URL' }, { status: 400 })
  }

  const slug = match[1]

  const { data: deck } = await supabaseAdmin
    .from('decks')
    .select('name, description, thumbnail_url, slide_count')
    .eq('slug', slug)
    .single()

  if (!deck) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
  }

  const response = {
    version: '1.0',
    type: 'rich',
    provider_name: 'SlideNerds',
    provider_url: 'https://slidenerds.com',
    title: deck.name,
    description: deck.description ?? undefined,
    thumbnail_url: deck.thumbnail_url ?? undefined,
    width: 960,
    height: 540,
    html: `<iframe src="${url}" width="960" height="540" frameborder="0" allowfullscreen title="${deck.name.replace(/[&<>"']/g, (c: string) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c))}"></iframe>`,
  }

  return NextResponse.json(response, {
    headers: {
      'Content-Type': 'application/json+oembed',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
