import { describe, it, expect, vi } from 'vitest'
import { exportDeck } from './export.js'

describe('exportDeck', () => {
  it('should log PPTX guidance message', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await exportDeck('pptx', 'http://localhost:3000')

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('PPTX export'))
    logSpy.mockRestore()
  })

  it('should log Google Slides guidance message', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await exportDeck('gslides', 'http://localhost:3000')

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Google Slides export'))
    logSpy.mockRestore()
  })
})
