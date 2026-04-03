#!/usr/bin/env node

import { Command } from 'commander'
import { registerCreateCommand } from './commands/create.js'
import { registerExportCommand } from './commands/export.js'
import { registerAnalyticsCommand } from './commands/analytics.js'

const program = new Command()

program.name('slidenerds').description('CLI for creating and managing slidenerds decks').version('0.1.0')

registerCreateCommand(program)
registerExportCommand(program)
registerAnalyticsCommand(program)

program.parse()
