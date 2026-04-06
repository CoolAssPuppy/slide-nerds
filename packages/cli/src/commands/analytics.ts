import { Command } from 'commander'
import path from 'node:path'
import fs from 'fs-extra'
import { getTemplatePath } from '../template-path.js'

type AnalyticsProvider = 'gtm' | 'ga4' | 'posthog' | 'plausible' | 'custom'

const ANALYTICS_ID_PLACEHOLDER = '{{ANALYTICS_ID}}'

export const injectAnalytics = async (
  provider: AnalyticsProvider,
  analyticsId: string,
  targetDir: string,
): Promise<string> => {
  const templatesDir = getTemplatePath('analytics')
  const templatePath = path.join(templatesDir, `${provider}.tsx.tmpl`)

  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`Analytics template not found for provider: ${provider}`)
  }

  const template = await fs.readFile(templatePath, 'utf-8')
  const content = template.replaceAll(ANALYTICS_ID_PLACEHOLDER, analyticsId)

  const componentDir = path.join(targetDir, 'components')
  await fs.ensureDir(componentDir)
  const outputPath = path.join(componentDir, `${provider}-analytics.tsx`)
  await fs.writeFile(outputPath, content, 'utf-8')

  return outputPath
}

export const registerAnalyticsCommand = (program: Command): void => {
  program
    .command('analytics')
    .description('Add an analytics provider to your deck')
    .option('--gtm <id>', 'Google Tag Manager ID (GTM-XXXXXX)')
    .option('--ga4 <id>', 'Google Analytics 4 ID (G-XXXXXXXXXX)')
    .option('--posthog <id>', 'PostHog project key (phc_XXXXXXXXXX)')
    .option('--plausible <domain>', 'Plausible domain (yourdomain.com)')
    .option('--custom', 'Drop a blank analytics component for manual wiring')
    .action(async (options: Record<string, string | boolean | undefined>) => {
      const PROVIDERS: AnalyticsProvider[] = ['gtm', 'ga4', 'posthog', 'plausible', 'custom']

      const matched = PROVIDERS.find((p) => options[p] !== undefined)
      if (!matched) {
        console.error('Specify a provider: --gtm, --ga4, --posthog, --plausible, or --custom')
        process.exit(1)
      }

      const analyticsId = typeof options[matched] === 'string'
        ? options[matched]
        : ''

      const targetDir = process.cwd()
      const outputPath = await injectAnalytics(matched, analyticsId, targetDir)
      console.info(`Analytics component created: ${path.relative(targetDir, outputPath)}`)
      console.info('Import this component in your root layout to activate analytics.')
    })
}
