import { Command } from 'commander'
import path from 'node:path'
import fs from 'fs-extra'
import { execFile } from 'node:child_process'
import { getCredentials, getProjectConfig, getServiceUrl } from './config.js'

const PUSH_DISABLED_MESSAGE = 'push not enabled. To apply for push access go to your slidenerds.com dashboard and make a request.'

const execAsync = (cmd: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { cwd, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        reject(err)
        return
      }

      resolve({ stdout, stderr })
    })
  })
}

const buildProject = async (dir: string): Promise<string> => {
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

  let restoreConfig: (() => Promise<void>) | null = null
  if (!hasExportOutput) {
    const backup = configContent
    const modified = configContent.replace(
      /const\s+nextConfig\s*:\s*NextConfig\s*=\s*\{/,
      "const nextConfig: NextConfig = {\n  output: 'export',",
    )

    if (modified === configContent) {
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
    const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    await execAsync(npxCmd, ['next', 'build'], dir)
  } finally {
    if (restoreConfig) {
      await restoreConfig()
    }
  }

  const outDir = path.join(dir, 'out')
  if (!(await fs.pathExists(outDir))) {
    throw new Error('Build did not produce an "out" directory. Make sure next.config has output: "export".')
  }

  return outDir
}

const createZipFromDir = async (sourceDir: string): Promise<Buffer> => {
  const zipPath = path.join(path.dirname(sourceDir), 'slidenerds-push.zip')

  if (await fs.pathExists(zipPath)) {
    await fs.remove(zipPath)
  }

  const zipCmd = process.platform === 'win32' ? 'tar' : 'zip'
  const zipArgs = process.platform === 'win32'
    ? ['-cf', zipPath, '-C', sourceDir, '.']
    : ['-r', zipPath, '.']

  await execAsync(zipCmd, zipArgs, sourceDir)

  const buffer = await fs.readFile(zipPath)
  await fs.remove(zipPath)
  return buffer
}

export const checkPushAccess = async (options: { serviceUrl: string; accessToken: string }): Promise<boolean> => {
  const response = await fetch(`${options.serviceUrl}/api/cli/push-access`, {
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
    },
  })

  if (response.status === 401) {
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    throw new Error('Unable to verify push access right now. Please try again.')
  }

  const payload = await response.json() as { push_enabled?: boolean }
  return payload.push_enabled === true
}

export const pushDeck = async (options: {
  dir: string
  deckId: string
  serviceUrl: string
  accessToken: string
  skipBuild?: boolean
}): Promise<{ version: number; url: string }> => {
  const { dir, deckId, serviceUrl, accessToken, skipBuild } = options

  const outDir = skipBuild
    ? path.join(dir, 'out')
    : await buildProject(dir)

  if (skipBuild && !(await fs.pathExists(outDir))) {
    throw new Error('No "out" directory found. Run `next build` first or remove --skip-build.')
  }

  console.info('Packaging...')
  const zipBuffer = await createZipFromDir(outDir)
  const sizeMb = (zipBuffer.length / 1024 / 1024).toFixed(1)
  console.info(`Package size: ${sizeMb} MB`)

  console.info('Uploading...')
  const formData = new FormData()
  formData.append('file', new Blob([zipBuffer.buffer as ArrayBuffer], { type: 'application/zip' }), 'deck.zip')

  const response = await fetch(`${serviceUrl}/api/decks/${deckId}/push`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  })

  if (!response.ok) {
    const errorResponse = await response.json().catch(() => ({ error: `HTTP ${response.status}` })) as { error?: string }
    throw new Error(errorResponse.error ?? `Upload failed: ${response.status}`)
  }

  const result = await response.json() as { version: number; deck?: { slug?: string } }

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

      const credentials = await getCredentials()
      if (!credentials) {
        console.error('Not logged in. Run `slidenerds login` first.')
        process.exit(1)
      }

      try {
        const serviceUrl = await getServiceUrl()
        const hasPushAccess = await checkPushAccess({
          serviceUrl,
          accessToken: credentials.access_token,
        })

        if (!hasPushAccess) {
          console.error(PUSH_DISABLED_MESSAGE)
          process.exit(1)
        }

        const { version, url } = await pushDeck({
          dir,
          deckId: config.deck_id,
          serviceUrl,
          accessToken: credentials.access_token,
          skipBuild: options.skipBuild,
        })

        console.info(`\nPushed version ${version}`)
        console.info(`View at: ${url}\n`)
      } catch (error) {
        console.error(`Push failed: ${error instanceof Error ? error.message : error}`)
        process.exit(1)
      }
    })
}
