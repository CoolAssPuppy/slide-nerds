import { describe, it, expect, afterEach } from 'vitest'
import path from 'node:path'
import fs from 'fs-extra'
import os from 'node:os'
import { injectAnalytics } from './analytics.js'

const createTempDir = async (): Promise<string> => {
  const dir = path.join(os.tmpdir(), `slidenerds-analytics-test-${Date.now()}`)
  await fs.ensureDir(dir)
  return dir
}

describe('injectAnalytics', () => {
  const tempDirs: string[] = []

  afterEach(async () => {
    for (const dir of tempDirs) {
      await fs.remove(dir)
    }
    tempDirs.length = 0
  })

  it('should create a GTM analytics component with the provided ID', async () => {
    const tempDir = await createTempDir()
    tempDirs.push(tempDir)

    const outputPath = await injectAnalytics('gtm', 'GTM-ABCDEF', tempDir)

    expect(outputPath).toContain('gtm-analytics.tsx')
    const content = await fs.readFile(outputPath, 'utf-8')
    expect(content).toContain('GTM-ABCDEF')
    expect(content).not.toContain('{{ANALYTICS_ID}}')
  })

  it('should create a GA4 analytics component', async () => {
    const tempDir = await createTempDir()
    tempDirs.push(tempDir)

    const outputPath = await injectAnalytics('ga4', 'G-XXXXXXXXXX', tempDir)

    const content = await fs.readFile(outputPath, 'utf-8')
    expect(content).toContain('G-XXXXXXXXXX')
  })

  it('should create a PostHog analytics component', async () => {
    const tempDir = await createTempDir()
    tempDirs.push(tempDir)

    const outputPath = await injectAnalytics('posthog', 'phc_12345', tempDir)

    const content = await fs.readFile(outputPath, 'utf-8')
    expect(content).toContain('phc_12345')
  })

  it('should create a Plausible analytics component', async () => {
    const tempDir = await createTempDir()
    tempDirs.push(tempDir)

    const outputPath = await injectAnalytics('plausible', 'example.com', tempDir)

    const content = await fs.readFile(outputPath, 'utf-8')
    expect(content).toContain('example.com')
  })

  it('should create a custom analytics component', async () => {
    const tempDir = await createTempDir()
    tempDirs.push(tempDir)

    const outputPath = await injectAnalytics('custom', '', tempDir)

    const content = await fs.readFile(outputPath, 'utf-8')
    expect(content).toContain('CustomAnalytics')
  })

  it('should create components directory if it does not exist', async () => {
    const tempDir = await createTempDir()
    tempDirs.push(tempDir)

    await injectAnalytics('gtm', 'GTM-TEST', tempDir)

    const componentsDir = path.join(tempDir, 'components')
    expect(await fs.pathExists(componentsDir)).toBe(true)
  })
})
