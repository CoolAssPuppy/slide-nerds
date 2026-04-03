import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  'packages/runtime',
  'packages/cli',
  {
    test: {
      name: 'skills',
      include: ['skills/**/*.test.ts'],
    },
  },
])
