import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')

  if (!domain) {
    return NextResponse.json({ error: 'Missing domain' }, { status: 400 })
  }

  const { data: customDomain } = await supabaseAdmin
    .from('custom_domains')
    .select('deck_id, is_verified, decks(slug)')
    .eq('domain', domain.toLowerCase())
    .eq('is_verified', true)
    .single()

  if (!customDomain) {
    return new NextResponse('Domain not configured', { status: 404 })
  }

  const slug = (customDomain as Record<string, unknown>).decks as { slug: string } | null

  if (!slug?.slug) {
    return new NextResponse('Deck not found', { status: 404 })
  }

  // Redirect to the deck viewer
  const viewerUrl = new URL(`/d/${slug.slug}`, request.url)
  return NextResponse.redirect(viewerUrl)
}
