import { NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/api-client'
import { supabaseAdmin } from '@/lib/supabase/admin'

type RouteContext = {
  params: Promise<{ id: string }>
}

type ExtractedSlide = {
  headings: string[]
  bodyItems: string[]
  notes: string
  images: string[]
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

  let deckUrl: string | null = null
  let tempShareToken: string | null = null

  if (deck.bundle_path) {
    const { data: shareLink } = await supabaseAdmin
      .from('share_links')
      .insert({
        deck_id: deck.id,
        access_type: 'public',
        expires_at: new Date(Date.now() + 60000).toISOString(),
      })
      .select('token')
      .single()

    if (!shareLink) {
      return NextResponse.json({ error: 'Failed to create export session' }, { status: 500 })
    }

    tempShareToken = shareLink.token
    deckUrl = `${getOrigin(request)}/api/hosted/${deck.id}/index.html?token=${tempShareToken}`
  } else {
    deckUrl = deck.deployed_url || deck.url
  }

  if (!deckUrl) {
    return NextResponse.json({ error: 'Deck has no content to export' }, { status: 400 })
  }

  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.default.launch({ headless: true })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })
    await page.goto(deckUrl, { waitUntil: 'networkidle0', timeout: 30000 })

    const slides = await extractSlides(page)

    if (slides.length === 0) {
      return NextResponse.json({ error: 'No slides found in deck' }, { status: 400 })
    }

    const pptxBuffer = await buildPptx(slides)

    return new NextResponse(new Uint8Array(pptxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${sanitizeFilename(deck.name)}.pptx"`,
      },
    })
  } finally {
    await browser.close()

    if (tempShareToken) {
      await supabaseAdmin
        .from('share_links')
        .delete()
        .eq('token', tempShareToken)
    }
  }
}

async function extractSlides(page: import('puppeteer').Page): Promise<ExtractedSlide[]> {
  return page.evaluate(() => {
    const slideElements = document.querySelectorAll('[data-slide]')
    const results: ExtractedSlide[] = []

    slideElements.forEach((slide) => {
      const headings = Array.from(slide.querySelectorAll('h1, h2, h3')).map(
        (el) => el.textContent?.trim() ?? ''
      ).filter(Boolean)

      const bodyItems = Array.from(slide.querySelectorAll('p, li')).map(
        (el) => el.textContent?.trim() ?? ''
      ).filter(Boolean)

      const notes = slide.getAttribute('data-notes') ?? ''

      const images = Array.from(slide.querySelectorAll('img')).map(
        (el) => (el as HTMLImageElement).src
      ).filter(Boolean)

      results.push({ headings, bodyItems, notes, images })
    })

    return results
  })
}

async function buildPptx(slides: ExtractedSlide[]): Promise<Buffer> {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()

  pptx.layout = 'LAYOUT_WIDE'

  const TITLE_FONT_SIZE = 28
  const BODY_FONT_SIZE = 16
  const TITLE_COLOR = '222222'
  const BODY_COLOR = '444444'

  for (const slideData of slides) {
    const pptxSlide = pptx.addSlide()

    let currentY = 0.5

    if (slideData.headings.length > 0) {
      const titleText = slideData.headings.join(' - ')
      pptxSlide.addText(titleText, {
        x: 0.5,
        y: currentY,
        w: '90%',
        h: 0.8,
        fontSize: TITLE_FONT_SIZE,
        bold: true,
        color: TITLE_COLOR,
        valign: 'top',
      })
      currentY += 1.0
    }

    if (slideData.bodyItems.length > 0) {
      const bodyRows = slideData.bodyItems.map((text) => ({
        text,
        options: {
          fontSize: BODY_FONT_SIZE,
          color: BODY_COLOR,
          bullet: true as const,
          breakLine: true as const,
        },
      }))

      pptxSlide.addText(bodyRows, {
        x: 0.5,
        y: currentY,
        w: '90%',
        h: 4.0,
        valign: 'top',
      })
    }

    if (slideData.notes) {
      pptxSlide.addNotes(slideData.notes)
    }
  }

  const output = await pptx.write({ outputType: 'nodebuffer' })
  return Buffer.from(output as ArrayBuffer)
}

function getOrigin(request: Request): string {
  const url = new URL(request.url)
  return url.origin
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'deck'
}
