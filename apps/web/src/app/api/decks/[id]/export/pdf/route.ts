import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params
  const { supabase, user } = await createApiClient(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: deck } = await supabase
    .from('decks')
    .select('id, name, owner_id, bundle_path, deployed_url, url')
    .eq('id', id)
    .single()

  if (!deck || deck.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const deckUrl = deck.bundle_path
    ? `${getOrigin(request)}/api/hosted/${deck.id}/index.html`
    : deck.deployed_url || deck.url

  if (!deckUrl) {
    return NextResponse.json({ error: 'Deck has no content to export' }, { status: 400 })
  }

  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.default.launch({ headless: true })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })
    await page.goto(deckUrl, { waitUntil: 'networkidle0', timeout: 30000 })

    const pdf = await page.pdf({
      width: '1920px',
      height: '1080px',
      printBackground: true,
      landscape: true,
    })

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sanitizeFilename(deck.name)}.pdf"`,
      },
    })
  } finally {
    await browser.close()
  }
}

function getOrigin(request: Request): string {
  const url = new URL(request.url)
  return url.origin
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'deck'
}
