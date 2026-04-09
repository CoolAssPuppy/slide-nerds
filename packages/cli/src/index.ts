#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Command } from 'commander'
import { registerCreateCommand } from './commands/create.js'
import { registerExportCommand } from './commands/export.js'
import { registerAnalyticsCommand } from './commands/analytics.js'

const readPackageVersion = (): string => {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const packageJsonPath = path.resolve(here, '..', 'package.json')
  const raw = readFileSync(packageJsonPath, 'utf-8')
  const parsed = JSON.parse(raw) as { version?: string }
  return parsed.version ?? '0.0.0'
}

const program = new Command()

program
  .name('slidenerds')
  .description('CLI for creating and managing slidenerds decks')
  .version(readPackageVersion())

registerCreateCommand(program)
registerExportCommand(program)
registerAnalyticsCommand(program)

program.parse()
