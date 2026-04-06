import { describe, it, expect, vi } from 'vitest'
import { exportDeck } from './export.js'

describe('exportDeck', () => {
  it('should export PDF and log success', async () => {
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    vi.mock('puppeteer', () => ({
      default: {
        launch: vi.fn().mockResolvedValue({
          newPage: vi.fn().mockResolvedValue({
            goto: vi.fn().mockResolvedValue(undefined),
            pdf: vi.fn().mockResolvedValue(undefined),
          }),
          close: vi.fn().mockResolvedValue(undefined),
        }),
      },
    }))

    await exportDeck('http://localhost:3000')

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('deck.pdf'))
    logSpy.mockRestore()
  })
})
