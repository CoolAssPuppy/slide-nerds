import { describe, it, expect, afterEach } from 'vitest'
import path from 'node:path'
import fs from 'fs-extra'
import os from 'node:os'
import { scaffoldProject } from './create.js'

const createTempDir = async (): Promise<string> => {
  const dir = path.join(os.tmpdir(), `slidenerds-test-${Date.now()}`)
  await fs.ensureDir(dir)
  return dir
}

describe('scaffoldProject', () => {
  const tempDirs: string[] = []

  afterEach(async () => {
    for (const dir of tempDirs) {
      await fs.remove(dir)
    }
    tempDirs.length = 0
  })

  it('should create all template files in target directory', async () => {
    const tempDir = await createTempDir()
    tempDirs.push(tempDir)
    const targetDir = path.join(tempDir, 'my-deck')

    const files = await scaffoldProject('my-deck', targetDir)

    expect(files.length).toBeGreaterThan(0)
    expect(files).toContain('package.json')
    expect(files).toContain('brand.config.ts')
    expect(files).toContain('CLAUDE.md')
    expect(files).toContain('README.md')
    expect(files).toContain('app/layout.tsx')
    expect(files).toContain('app/page.tsx')
    expect(files).toContain('app/globals.css')
    expect(files).toContain('tsconfig.json')
  })

  it('should replace project name placeholder in all files', async () => {
    const tempDir = await createTempDir()
    tempDirs.push(tempDir)
    const targetDir = path.join(tempDir, 'my-talk')

    await scaffoldProject('my-talk', targetDir)

    const packageJson = await fs.readFile(path.join(targetDir, 'package.json'), 'utf-8')
    expect(packageJson).toContain('"name": "my-talk"')
    expect(packageJson).not.toContain('{{PROJECT_NAME}}')

    const claudeMd = await fs.readFile(path.join(targetDir, 'CLAUDE.md'), 'utf-8')
    expect(claudeMd).toContain('# my-talk')
    expect(claudeMd).not.toContain('{{PROJECT_NAME}}')
  })

  it('should create a valid package.json with runtime dependency', async () => {
    const tempDir = await createTempDir()
    tempDirs.push(tempDir)
    const targetDir = path.join(tempDir, 'test-deck')

    await scaffoldProject('test-deck', targetDir)

    const pkg = JSON.parse(await fs.readFile(path.join(targetDir, 'package.json'), 'utf-8'))
    expect(pkg.dependencies['@slidenerds/runtime']).toBeDefined()
    expect(pkg.dependencies['next']).toBeDefined()
    expect(pkg.dependencies['react']).toBeDefined()
  })

  it('should create layout with SlideRuntime wrapper', async () => {
    const tempDir = await createTempDir()
    tempDirs.push(tempDir)
    const targetDir = path.join(tempDir, 'test-deck')

    await scaffoldProject('test-deck', targetDir)

    const layout = await fs.readFile(path.join(targetDir, 'app', 'layout.tsx'), 'utf-8')
    expect(layout).toContain('SlideRuntime')
    expect(layout).toContain("import { SlideRuntime } from '@slidenerds/runtime'")
  })

  it('should create page with example slides using data conventions', async () => {
    const tempDir = await createTempDir()
    tempDirs.push(tempDir)
    const targetDir = path.join(tempDir, 'test-deck')

    await scaffoldProject('test-deck', targetDir)

    const page = await fs.readFile(path.join(targetDir, 'app', 'page.tsx'), 'utf-8')
    expect(page).toContain('data-slide')
    expect(page).toContain('data-step')
    expect(page).toContain('data-notes')
  })
})
