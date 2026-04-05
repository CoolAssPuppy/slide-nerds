#!/usr/bin/env node

import { Command } from 'commander'
import { registerCreateCommand } from './commands/create.js'
import { registerExportCommand } from './commands/export.js'
import { registerAnalyticsCommand } from './commands/analytics.js'
import { registerLoginCommand } from './commands/login.js'
import { registerLinkCommand } from './commands/link.js'
import { registerPushCommand } from './commands/push.js'
import { registerBrandCommand } from './commands/brand.js'

const program = new Command()

program.name('slidenerds').description('CLI for creating and managing slidenerds decks').version('0.1.0')

registerCreateCommand(program)
registerExportCommand(program)
registerAnalyticsCommand(program)
registerLoginCommand(program)
registerLinkCommand(program)
registerPushCommand(program)
registerBrandCommand(program)

program.parse()
