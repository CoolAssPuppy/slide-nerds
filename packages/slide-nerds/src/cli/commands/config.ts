import path from 'node:path'
import os from 'node:os'
import fs from 'fs-extra'

const CONFIG_DIR = path.join(os.homedir(), '.slidenerds')
const CREDENTIALS_FILE = path.join(CONFIG_DIR, 'credentials.json')
const PROJECT_CONFIG_FILE = '.slidenerds.json'

type Credentials = {
  access_token: string
  refresh_token: string
  url: string
}

export type ProjectConfig = {
  deck_id: string
  deck_name: string
  service_url: string
  telemetry_token?: string
  telemetry_endpoint?: string
}

export const getCredentials = async (): Promise<Credentials | null> => {
  if (!(await fs.pathExists(CREDENTIALS_FILE))) return null
  const data = await fs.readJson(CREDENTIALS_FILE)
  return data as Credentials
}

export const saveCredentials = async (creds: Credentials): Promise<void> => {
  await fs.ensureDir(CONFIG_DIR)
  await fs.writeJson(CREDENTIALS_FILE, creds, { spaces: 2 })
}

export const clearCredentials = async (): Promise<void> => {
  if (await fs.pathExists(CREDENTIALS_FILE)) {
    await fs.remove(CREDENTIALS_FILE)
  }
}

export const getProjectConfig = async (dir: string = process.cwd()): Promise<ProjectConfig | null> => {
  const configPath = path.join(dir, PROJECT_CONFIG_FILE)
  if (!(await fs.pathExists(configPath))) return null
  const data = await fs.readJson(configPath)
  return data as ProjectConfig
}

export const saveProjectConfig = async (
  config: ProjectConfig,
  dir: string = process.cwd(),
): Promise<void> => {
  const configPath = path.join(dir, PROJECT_CONFIG_FILE)
  await fs.writeJson(configPath, config, { spaces: 2 })
}

export const getServiceUrl = async (): Promise<string> => {
  const creds = await getCredentials()
  return creds?.url ?? 'https://www.slidenerds.com'
}
