import { Command } from 'commander'
import path from 'node:path'
import fs from 'fs-extra'
import { getCredentials, getProjectConfig, saveProjectConfig, getServiceUrl } from './config.js'

const detectProjectName = async (dir: string): Promise<string> => {
  const pkgPath = path.join(dir, 'package.json')
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath)
    return pkg.name ?? path.basename(dir)
  }
  return path.basename(dir)
}

const isSlidenerdProject = async (dir: string): Promise<boolean> => {
  const brandConfig = path.join(dir, 'brand.config.ts')
  if (await fs.pathExists(brandConfig)) return true

  const pkgPath = path.join(dir, 'package.json')
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJson(pkgPath)
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    return '@strategicnerds/slide-nerds' in deps
  }

  return false
}

const provisionTelemetryToken = async (
  serviceUrl: string,
  accessToken: string,
  deckId: string,
): Promise<string | null> => {
  const resp = await fetch(`${serviceUrl}/api/decks/${deckId}/telemetry-token`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!resp.ok) return null

  const body = await resp.json()
  if (typeof body?.token !== 'string') return null

  return body.token
}

const buildTelemetryClientComponent = (serviceUrl: string, deckId: string, telemetryToken: string): string => {
  const endpoint = `${serviceUrl.replace(/\/$/, '')}/api/telemetry/slide`

  return `'use client'

import { useEffect, useRef } from 'react'

type SlideNerdsTelemetryProps = {
  deckId?: string
  endpoint?: string
  telemetryToken?: string
}

const getCurrentSlideIndex = (): number => {
  if (typeof window === 'undefined') return 0
  const slideParam = new URLSearchParams(window.location.search).get('slide')
  if (!slideParam) return 0

  const parsed = Number.parseInt(slideParam, 10)
  if (Number.isNaN(parsed) || parsed < 1) return 0
  return parsed - 1
}

const postTelemetry = async (payload: {
  deck_id: string
  slide_index: number
  dwell_seconds: number
  telemetry_token: string
}, endpoint: string): Promise<void> => {
  await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    keepalive: true,
  })
}

export function SlideNerdsTelemetry({
  deckId = '${deckId}',
  endpoint = '${endpoint}',
  telemetryToken = '${telemetryToken}',
}: SlideNerdsTelemetryProps) {
  const lastSlideRef = useRef(0)
  const enteredAtRef = useRef(Date.now())

  useEffect(() => {
    lastSlideRef.current = getCurrentSlideIndex()
    enteredAtRef.current = Date.now()

    const flushCurrentSlide = () => {
      const now = Date.now()
      const dwellSeconds = Math.floor((now - enteredAtRef.current) / 1000)
      const slideIndex = lastSlideRef.current

      enteredAtRef.current = now
      if (dwellSeconds < 1) return

      postTelemetry(
        {
          deck_id: deckId,
          slide_index: slideIndex,
          dwell_seconds: dwellSeconds,
          telemetry_token: telemetryToken,
        },
        endpoint,
      ).catch(() => {
        // Never block the presenter on telemetry failures.
      })
    }

    const onNavigation = () => {
      flushCurrentSlide()
      lastSlideRef.current = getCurrentSlideIndex()
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushCurrentSlide()
      }
    }

    window.addEventListener('popstate', onNavigation)
    window.addEventListener('hashchange', onNavigation)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('beforeunload', flushCurrentSlide)

    return () => {
      window.removeEventListener('popstate', onNavigation)
      window.removeEventListener('hashchange', onNavigation)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', flushCurrentSlide)
      flushCurrentSlide()
    }
  }, [deckId, endpoint, telemetryToken])

  return null
}
`
}

const wireTelemetryIntoLayout = async (projectDir: string): Promise<boolean> => {
  const layoutPath = path.join(projectDir, 'app', 'layout.tsx')
  if (!(await fs.pathExists(layoutPath))) return false

  const content = await fs.readFile(layoutPath, 'utf8')
  if (content.includes('SlideNerdsTelemetry')) return true

  let updated = content

  updated = updated.replace(
    "import './globals.css'",
    "import './globals.css'\nimport { SlideNerdsTelemetry } from '../components/slidenerds-telemetry'",
  )

  if (!updated.includes('SlideNerdsTelemetry')) return false

  updated = updated.replace('<SlideRuntime>{children}</SlideRuntime>', '<SlideRuntime>{children}</SlideRuntime>\n        <SlideNerdsTelemetry />')

  await fs.writeFile(layoutPath, updated, 'utf8')
  return true
}

const ensureTelemetryClient = async (
  projectDir: string,
  serviceUrl: string,
  deckId: string,
  telemetryToken: string,
): Promise<boolean> => {
  const componentsDir = path.join(projectDir, 'components')
  await fs.ensureDir(componentsDir)

  const telemetryComponentPath = path.join(componentsDir, 'slidenerds-telemetry.tsx')
  const component = buildTelemetryClientComponent(serviceUrl, deckId, telemetryToken)
  await fs.writeFile(telemetryComponentPath, component, 'utf8')

  return wireTelemetryIntoLayout(projectDir)
}

export const linkProject = async (options: {
  name?: string
  url: string
  deckId?: string
  serviceUrl: string
  accessToken: string
}): Promise<{ deckId: string; deckName: string; telemetryConfigured: boolean }> => {
  const dir = process.cwd()
  const { serviceUrl, accessToken, url } = options

  let deckId: string
  let deckName: string

  if (options.deckId) {
    const resp = await fetch(`${serviceUrl}/api/decks/${options.deckId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!resp.ok) throw new Error('Deck not found')

    const deck = await resp.json()
    deckId = deck.id
    deckName = deck.name
  } else {
    const name = options.name ?? await detectProjectName(dir)
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    const resp = await fetch(`${serviceUrl}/api/decks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, slug, url, deployed_url: url, source_type: 'url' }),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(err.error ?? `Failed to create deck: ${resp.status}`)
    }

    const deck = await resp.json()
    deckId = deck.id
    deckName = deck.name
  }

  const telemetryToken = await provisionTelemetryToken(serviceUrl, accessToken, deckId)

  await saveProjectConfig({
    deck_id: deckId,
    deck_name: deckName,
    service_url: serviceUrl,
    telemetry_token: telemetryToken ?? undefined,
    telemetry_endpoint: `${serviceUrl.replace(/\/$/, '')}/api/telemetry/slide`,
  }, dir)

  const telemetryConfigured = telemetryToken
    ? await ensureTelemetryClient(dir, serviceUrl, deckId, telemetryToken)
    : false

  return { deckId, deckName, telemetryConfigured }
}

export const registerLinkCommand = (program: Command): void => {
  program
    .command('link')
    .description('Link this project to a deck on slidenerds.com')
    .requiredOption('--url <url>', 'Deployed URL of your deck (e.g. https://my-talk.vercel.app)')
    .option('--name <name>', 'Deck name (defaults to package name)')
    .option('--deck-id <id>', 'Link to an existing deck by ID')
    .action(async (options: { url: string; name?: string; deckId?: string }) => {
      const dir = process.cwd()

      if (!(await isSlidenerdProject(dir))) {
        console.error('This does not look like a slidenerds project.')
        console.error('Run this from a directory with brand.config.ts or @strategicnerds/slide-nerds as a dependency.')
        process.exit(1)
      }

      const existing = await getProjectConfig(dir)
      if (existing) {
        console.info(`Already linked to "${existing.deck_name}" (${existing.deck_id})`)
        console.info('Delete .slidenerds.json to unlink.')
        return
      }

      const creds = await getCredentials()
      if (!creds) {
        console.error('Not logged in. Run `slidenerds login` first.')
        process.exit(1)
      }

      try {
        const serviceUrl = await getServiceUrl()
        const { deckId, deckName, telemetryConfigured } = await linkProject({
          name: options.name,
          url: options.url,
          deckId: options.deckId,
          serviceUrl,
          accessToken: creds.access_token,
        })

        console.info(`Linked to "${deckName}" (${deckId})`)
        console.info(`Deck URL: ${options.url}`)
        console.info('Your deck is now registered on slidenerds.com.')

        if (telemetryConfigured) {
          console.info('Configured built-in SlideNerds telemetry in app/layout.tsx.')
        } else {
          console.info('Telemetry token provisioning skipped or unavailable; you can still add your own analytics.')
        }
      } catch (err) {
        console.error(`Link failed: ${err instanceof Error ? err.message : err}`)
        process.exit(1)
      }
    })
}
