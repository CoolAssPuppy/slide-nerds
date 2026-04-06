import { Command } from 'commander'
import path from 'node:path'
import fs from 'fs-extra'
import { getCredentials, getServiceUrl } from './config.js'

type BrandConfigResponse = {
  id: string
  name: string
  config: Record<string, unknown>
  owner_id: string | null
  team_id: string | null
  created_at: string
  updated_at: string
}

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const creds = await getCredentials()
  if (!creds) {
    throw new Error('Not logged in. Run `slidenerds login` first.')
  }

  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${creds.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

const brandGet = async (name: string): Promise<void> => {
  const serviceUrl = await getServiceUrl()
  const encodedName = encodeURIComponent(name)
  const resp = await fetchWithAuth(`${serviceUrl}/api/brands?name=${encodedName}`)

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error ?? `Failed to fetch brand config: ${resp.status}`)
  }

  const configs = (await resp.json()) as BrandConfigResponse[]

  if (configs.length === 0) {
    throw new Error(`No brand config found with name "${name}"`)
  }

  const config = configs[0].config
  const filePath = path.join(process.cwd(), 'brand.config.ts')

  const fileContent = `import type { BrandConfig } from '@strategicnerds/slide-nerds'

export default ${JSON.stringify(config, null, 2)} satisfies BrandConfig
`

  await fs.writeFile(filePath, fileContent, 'utf-8')
  console.info(`Wrote brand config "${name}" to brand.config.ts`)
}

const brandSet = async (name: string): Promise<void> => {
  const filePath = path.join(process.cwd(), 'brand.config.ts')

  if (!(await fs.pathExists(filePath))) {
    throw new Error('No brand.config.ts found in the current directory.')
  }

  const serviceUrl = await getServiceUrl()

  // Build and import the brand config from the local file.
  // Use a timestamp query param to bust any module cache.
  const absolutePath = path.resolve(filePath)
  const imported = await import(`${absolutePath}?t=${Date.now()}`)
  const config = imported.default as Record<string, unknown>

  if (!config || typeof config !== 'object') {
    throw new Error('brand.config.ts must export a default object.')
  }

  // Check if a config with this name already exists
  const encodedName = encodeURIComponent(name)
  const listResp = await fetchWithAuth(`${serviceUrl}/api/brands?name=${encodedName}`)

  if (!listResp.ok) {
    throw new Error(`Failed to check existing configs: ${listResp.status}`)
  }

  const existing = (await listResp.json()) as BrandConfigResponse[]

  if (existing.length > 0) {
    // Update existing
    const resp = await fetchWithAuth(`${serviceUrl}/api/brands/${existing[0].id}`, {
      method: 'PATCH',
      body: JSON.stringify({ config }),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(err.error ?? `Failed to update brand config: ${resp.status}`)
    }

    console.info(`Updated brand config "${name}"`)
  } else {
    // Create new
    const resp = await fetchWithAuth(`${serviceUrl}/api/brands`, {
      method: 'POST',
      body: JSON.stringify({ name, config }),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(err.error ?? `Failed to create brand config: ${resp.status}`)
    }

    console.info(`Created brand config "${name}"`)
  }
}

const brandList = async (): Promise<void> => {
  const serviceUrl = await getServiceUrl()
  const resp = await fetchWithAuth(`${serviceUrl}/api/brands`)

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error ?? `Failed to list brand configs: ${resp.status}`)
  }

  const configs = (await resp.json()) as BrandConfigResponse[]

  if (configs.length === 0) {
    console.info('No brand configs found.')
    return
  }

  console.info(`Found ${configs.length} brand config(s):\n`)
  for (const c of configs) {
    const scope = c.team_id ? 'team' : 'personal'
    const updated = new Date(c.updated_at).toLocaleDateString()
    console.info(`  ${c.name} (${scope}) -- updated ${updated}`)
  }
}

export const registerBrandCommand = (program: Command): void => {
  const brand = program
    .command('brand')
    .description('Manage brand configurations on slidenerds.com')

  brand
    .command('get <name>')
    .description('Download a brand config and write it to brand.config.ts')
    .action(async (name: string) => {
      try {
        await brandGet(name)
      } catch (err) {
        console.error(`brand get failed: ${err instanceof Error ? err.message : err}`)
        process.exit(1)
      }
    })

  brand
    .command('set <name>')
    .description('Upload the local brand.config.ts to slidenerds.com')
    .action(async (name: string) => {
      try {
        await brandSet(name)
      } catch (err) {
        console.error(`brand set failed: ${err instanceof Error ? err.message : err}`)
        process.exit(1)
      }
    })

  brand
    .command('list')
    .description('List all saved brand configs')
    .action(async () => {
      try {
        await brandList()
      } catch (err) {
        console.error(`brand list failed: ${err instanceof Error ? err.message : err}`)
        process.exit(1)
      }
    })
}
