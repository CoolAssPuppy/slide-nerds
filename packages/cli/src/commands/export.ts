import { Command } from 'commander'

type ExportFormat = 'pdf' | 'pptx' | 'gslides'

export const exportDeck = async (format: ExportFormat, url: string): Promise<void> => {
  switch (format) {
    case 'pdf': {
      const puppeteer = await import('puppeteer')
      const browser = await puppeteer.default.launch({ headless: true })
      const page = await browser.newPage()
      await page.goto(url, { waitUntil: 'networkidle0' })
      await page.pdf({ path: 'deck.pdf', format: 'A4', landscape: true, printBackground: true })
      await browser.close()
      console.log('Exported: deck.pdf')
      break
    }
    case 'pptx':
      console.log('PPTX export: Run the dev server and use window.slidenerds.export({ format: "pptx" })')
      break
    case 'gslides':
      console.log('Google Slides export: Run the dev server and use window.slidenerds.export({ format: "gslides" })')
      break
  }
}

export const registerExportCommand = (program: Command): void => {
  program
    .command('export')
    .description('Export the deck to PDF, PPTX, or Google Slides')
    .option('--pdf', 'Export as PDF')
    .option('--pptx', 'Export as PowerPoint')
    .option('--gslides', 'Export as Google Slides')
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
