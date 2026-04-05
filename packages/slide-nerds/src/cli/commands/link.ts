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

export const linkProject = async (options: {
  name?: string
  deckId?: string
  serviceUrl: string
  accessToken: string
}): Promise<{ deckId: string; deckName: string }> => {
  const dir = process.cwd()
  const { serviceUrl, accessToken } = options

  // If a deck ID is provided, just link to it
  if (options.deckId) {
    const resp = await fetch(`${serviceUrl}/api/decks/${options.deckId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!resp.ok) throw new Error('Deck not found')
    const deck = await resp.json()

    await saveProjectConfig({
      deck_id: deck.id,
      deck_name: deck.name,
      service_url: serviceUrl,
    }, dir)

    return { deckId: deck.id, deckName: deck.name }
  }

  // Otherwise, create a new deck
  const name = options.name ?? await detectProjectName(dir)
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const resp = await fetch(`${serviceUrl}/api/decks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, slug, source_type: 'push' }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error ?? `Failed to create deck: ${resp.status}`)
  }

  const deck = await resp.json()

  await saveProjectConfig({
    deck_id: deck.id,
    deck_name: deck.name,
    service_url: serviceUrl,
  }, dir)

  return { deckId: deck.id, deckName: deck.name }
}

export const registerLinkCommand = (program: Command): void => {
  program
    .command('link')
    .description('Link this project to a deck on slidenerds.com')
    .option('--name <name>', 'Deck name (defaults to package name)')
    .option('--deck-id <id>', 'Link to an existing deck by ID')
    .action(async (options: { name?: string; deckId?: string }) => {
      const dir = process.cwd()

      if (!(await isSlidenerdProject(dir))) {
        console.error('This does not look like a slidenerds project.')
        console.error('Run this from a directory with brand.config.ts or @strategicnerds/slide-nerds as a dependency.')
        process.exit(1)
      }

      const existing = await getProjectConfig(dir)
      if (existing) {
        console.log(`Already linked to "${existing.deck_name}" (${existing.deck_id})`)
        console.log('Delete .slidenerds.json to unlink.')
        return
      }

      const creds = await getCredentials()
      if (!creds) {
        console.error('Not logged in. Run `slidenerds login` first.')
        process.exit(1)
      }

      try {
        const serviceUrl = await getServiceUrl()
        const { deckId, deckName } = await linkProject({
          name: options.name,
          deckId: options.deckId,
          serviceUrl,
          accessToken: creds.access_token,
        })

        console.log(`Linked to "${deckName}" (${deckId})`)
        console.log('Run `slidenerds push` to upload your deck.')
      } catch (err) {
        console.error(`Link failed: ${err instanceof Error ? err.message : err}`)
        process.exit(1)
      }
    })
}
