import { Command } from 'commander'
import path from 'node:path'
import fs from 'fs-extra'
import { execFile } from 'node:child_process'
import { getCredentials, getProjectConfig, getServiceUrl } from './config.js'

const execAsync = (cmd: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(err)
      else resolve({ stdout, stderr })
    })
  })
}

const buildProject = async (dir: string): Promise<string> => {
  console.log('Building project...')

  // Check if next.config has output: 'export' or if we need to add it
  const nextConfigPath = path.join(dir, 'next.config.ts')
  const nextConfigJsPath = path.join(dir, 'next.config.js')
  const nextConfigMjsPath = path.join(dir, 'next.config.mjs')

  const configPath = (await fs.pathExists(nextConfigPath))
    ? nextConfigPath
    : (await fs.pathExists(nextConfigJsPath))
      ? nextConfigJsPath
      : (await fs.pathExists(nextConfigMjsPath))
        ? nextConfigMjsPath
        : null

  if (!configPath) {
    throw new Error('No next.config.ts/js/mjs found. Is this a Next.js project?')
  }

  const configContent = await fs.readFile(configPath, 'utf-8')
  const hasExportOutput = /output\s*:\s*['"]export['"]/.test(configContent)

  // Temporarily add output: 'export' if not present
  let restoreConfig: (() => Promise<void>) | null = null
  if (!hasExportOutput) {
    const backup = configContent
    const modified = configContent.replace(
      /const\s+nextConfig\s*:\s*NextConfig\s*=\s*\{/,
      "const nextConfig: NextConfig = {\n  output: 'export',",
    )

    if (modified === configContent) {
      // Fallback: try the JS pattern
      const modifiedJs = configContent.replace(
        /const\s+nextConfig\s*=\s*\{/,
        "const nextConfig = {\n  output: 'export',",
      )
      if (modifiedJs !== configContent) {
        await fs.writeFile(configPath, modifiedJs)
        restoreConfig = async () => fs.writeFile(configPath, backup)
      }
    } else {
      await fs.writeFile(configPath, modified)
      restoreConfig = async () => fs.writeFile(configPath, backup)
    }
  }

  try {
    // Find npx path
    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    await execAsync(npxCmd, ['next', 'build'], dir)
  } finally {
    if (restoreConfig) await restoreConfig()
  }

  const outDir = path.join(dir, 'out')
  if (!(await fs.pathExists(outDir))) {
    throw new Error('Build did not produce an "out" directory. Make sure next.config has output: "export".')
  }

  return outDir
}

const createZipFromDir = async (sourceDir: string): Promise<Buffer> => {
  // Use tar + gzip as a cross-platform zip alternative
  // We'll create the zip using the archiver pattern with just fs
  // For simplicity, use the system zip command
  const zipPath = path.join(path.dirname(sourceDir), 'slidenerds-push.zip')

  // Clean up any previous zip
  if (await fs.pathExists(zipPath)) await fs.remove(zipPath)

  const zipCmd = process.platform === 'win32' ? 'tar' : 'zip'
  const zipArgs = process.platform === 'win32'
    ? ['-cf', zipPath, '-C', sourceDir, '.']
    : ['-r', zipPath, '.']
  const zipCwd = process.platform === 'win32' ? sourceDir : sourceDir

  await execAsync(zipCmd, zipArgs, zipCwd)

  const buffer = await fs.readFile(zipPath)
  await fs.remove(zipPath)

  return buffer
}

export const pushDeck = async (options: {
  dir: string
  deckId: string
  serviceUrl: string
  accessToken: string
  skipBuild?: boolean
}): Promise<{ version: number; url: string }> => {
  const { dir, deckId, serviceUrl, accessToken, skipBuild } = options

  // Build the project
  let outDir: string
  if (skipBuild) {
    outDir = path.join(dir, 'out')
    if (!(await fs.pathExists(outDir))) {
      throw new Error('No "out" directory found. Run `next build` first or remove --skip-build.')
    }
  } else {
    outDir = await buildProject(dir)
  }

  // Create zip
  console.log('Packaging...')
  const zipBuffer = await createZipFromDir(outDir)
  const sizeMb = (zipBuffer.length / 1024 / 1024).toFixed(1)
  console.log(`Package size: ${sizeMb} MB`)

  // Upload
  console.log('Uploading...')
  const formData = new FormData()
  formData.append('file', new Blob([zipBuffer.buffer as ArrayBuffer], { type: 'application/zip' }), 'deck.zip')

  const resp = await fetch(`${serviceUrl}/api/decks/${deckId}/push`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }))
    throw new Error(err.error ?? `Upload failed: ${resp.status}`)
  }

  const result = await resp.json()

  return {
    version: result.version,
    url: `${serviceUrl}/d/${result.deck?.slug ?? deckId}`,
  }
}

export const registerPushCommand = (program: Command): void => {
  program
    .command('push')
    .description('Build and upload your deck to slidenerds.com')
    .option('--skip-build', 'Skip the build step (use existing out/ directory)')
    .action(async (options: { skipBuild?: boolean }) => {
      const dir = process.cwd()

      const config = await getProjectConfig(dir)
      if (!config) {
        console.error('Project not linked. Run `slidenerds link` first.')
        process.exit(1)
      }

      const creds = await getCredentials()
      if (!creds) {
        console.error('Not logged in. Run `slidenerds login` first.')
        process.exit(1)
      }

      try {
        const serviceUrl = await getServiceUrl()
        const { version, url } = await pushDeck({
          dir,
          deckId: config.deck_id,
          serviceUrl,
          accessToken: creds.access_token,
          skipBuild: options.skipBuild,
        })

        console.log(`\nPushed version ${version}`)
        console.log(`View at: ${url}\n`)
      } catch (err) {
        console.error(`Push failed: ${err instanceof Error ? err.message : err}`)
        process.exit(1)
      }
    })
}
