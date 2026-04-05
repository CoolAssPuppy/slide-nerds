import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/runtime',
      'packages/cli',
      'apps/web',
      {
        test: {
          name: 'skills',
          include: ['skills/**/*.test.ts'],
        },
      },
    ],
  },
})
