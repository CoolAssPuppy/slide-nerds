import { Command } from 'commander'

type ExportFormat = 'pdf' | 'pptx' | 'gslides'

type SlideData = {
  title: string
  body: string[]
  notes: string[]
}

const extractSlides = async (url: string): Promise<SlideData[]> => {
  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.default.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle0' })

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
  return slides
}

const exportPdf = async (url: string): Promise<void> => {
  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.default.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle0' })
  await page.pdf({
    path: 'deck.pdf',
    format: 'A4',
    landscape: true,
    printBackground: true,
  })
  await browser.close()
  console.log('Exported: deck.pdf')
}

const exportPptx = async (url: string): Promise<void> => {
  const PptxGenJS = (await import('pptxgenjs')).default
  const slides = await extractSlides(url)
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
          options: { bullet: true, fontSize: 18, color: '333333', breakLine: true },
        })),
        { x: 0.5, y: 1.8, w: '90%', h: '60%' },
      )
    }

    if (slideData.notes.length > 0) {
      slide.addNotes(slideData.notes.join('\n\n'))
    }
  }

  await pptx.writeFile({ fileName: 'deck.pptx' })
  console.log('Exported: deck.pptx')
}

const exportGslides = async (url: string): Promise<void> => {
  await exportPptx(url)
  console.log(
    'Google Slides: Import the generated deck.pptx into Google Slides via File > Import.',
  )
}

export const exportDeck = async (format: ExportFormat, url: string): Promise<void> => {
  switch (format) {
    case 'pdf':
      await exportPdf(url)
      break
    case 'pptx':
      await exportPptx(url)
      break
    case 'gslides':
      await exportGslides(url)
      break
  }
}

export const registerExportCommand = (program: Command): void => {
  program
    .command('export')
    .description('Export the deck to PDF, PPTX, or Google Slides')
    .option('--pdf', 'Export as PDF')
    .option('--pptx', 'Export as PowerPoint')
    .option('--gslides', 'Export as Google Slides (generates PPTX for import)')
    .option('--url <url>', 'Dev server URL', 'http://localhost:3000')
    .action(async (options: { pdf?: boolean; pptx?: boolean; gslides?: boolean; url: string }) => {
      const format: ExportFormat | null = options.pdf
        ? 'pdf'
        : options.pptx
          ? 'pptx'
          : options.gslides
            ? 'gslides'
            : null

      if (!format) {
        console.error('Specify a format: --pdf, --pptx, or --gslides')
        process.exit(1)
      }

      await exportDeck(format, options.url)
    })
}
