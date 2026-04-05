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

  // Extract slide data using Puppeteer
  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.default.launch({ headless: true })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1920, height: 1080 })
    await page.goto(deckUrl, { waitUntil: 'networkidle0', timeout: 30000 })

    const slides = await page.evaluate(() => {
      const slideElements = document.querySelectorAll('[data-slide]')
      return Array.from(slideElements).map((slide) => {
        const heading = slide.querySelector('h1, h2, h3')
        const title = heading?.textContent?.trim() ?? ''

        const bodyElements = slide.querySelectorAll('p, li')
        const body = Array.from(bodyElements)
          .map((el) => el.textContent?.trim() ?? '')
          .filter((text) => text.length > 0)

        const noteElements = slide.querySelectorAll('[data-notes]')
        const notes = Array.from(noteElements)
          .map((el) => el.textContent?.trim() ?? '')
          .filter((text) => text.length > 0)

        return { title, body, notes }
      })
    })

    await browser.close()

    // Build PPTX
    const PptxGenJS = (await import('pptxgenjs')).default
    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_WIDE'

    for (const slideData of slides) {
      const slide = pptx.addSlide()

      if (slideData.title) {
        slide.addText(slideData.title, {
          x: 0.5,
          y: 0.5,
          w: '90%',
          fontSize: 32,
          bold: true,
          color: '1a1a2e',
        })
      }

      if (slideData.body.length > 0) {
        slide.addText(
          slideData.body.map((line) => ({
            text: line,
            options: { bullet: true, fontSize: 18, color: '333333', breakLine: true as const },
          })),
          { x: 0.5, y: 1.8, w: '90%', h: '60%' },
        )
      }

      if (slideData.notes.length > 0) {
        slide.addNotes(slideData.notes.join('\n\n'))
      }
    }

    const output = await pptx.write({ outputType: 'nodebuffer' })

    return new NextResponse(Buffer.from(output as ArrayBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${sanitizeFilename(deck.name)}.pptx"`,
      },
    })
  } catch (err) {
    await browser.close()
    throw err
  }
}

function getOrigin(request: Request): string {
  const url = new URL(request.url)
  return url.origin
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'deck'
}
