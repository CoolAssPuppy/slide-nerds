import { Command } from 'commander'

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
  console.info('Exported: deck.pdf')
}

export const exportDeck = async (url: string): Promise<void> => {
  await exportPdf(url)
}

export const registerExportCommand = (program: Command): void => {
  program
    .command('export')
    .description('Export the deck to PDF')
    .option('--pdf', 'Export as PDF')
    .option('--url <url>', 'Dev server URL', 'http://localhost:3000')
    .action(async (options: { pdf?: boolean; url: string }) => {
      if (!options.pdf) {
        console.error('Specify a format: --pdf')
        process.exit(1)
      }

      await exportDeck(options.url)
    })
}
