import { describe, it, expect, vi } from 'vitest'
import { exportDeck } from './export.js'

describe('exportDeck', () => {
  it('should log Google Slides import guidance after generating PPTX', async () => {
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    vi.mock('puppeteer', () => ({
      default: {
        launch: vi.fn().mockResolvedValue({
          newPage: vi.fn().mockResolvedValue({
            goto: vi.fn().mockResolvedValue(undefined),
            evaluate: vi.fn().mockResolvedValue([
              { title: 'Test', body: ['Hello'], notes: [] },
            ]),
            pdf: vi.fn().mockResolvedValue(undefined),
          }),
          close: vi.fn().mockResolvedValue(undefined),
        }),
      },
    }))

    vi.mock('pptxgenjs', () => ({
      default: vi.fn().mockImplementation(() => ({
        layout: '',
        addSlide: vi.fn().mockReturnValue({
          addText: vi.fn(),
          addNotes: vi.fn(),
        }),
        writeFile: vi.fn().mockResolvedValue(undefined),
      })),
    }))

    await exportDeck('gslides', 'http://localhost:3000')

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Google Slides'))
    logSpy.mockRestore()
  })
})
