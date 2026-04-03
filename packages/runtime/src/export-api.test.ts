import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerExportApi } from './export-api'

describe('registerExportApi', () => {
  beforeEach(() => {
    delete (window as Record<string, unknown>).slidenerds
  })

  it('should register slidenerds object on window', () => {
    registerExportApi()
    expect(window.slidenerds).toBeDefined()
    expect(typeof window.slidenerds.export).toBe('function')
  })

  it('should call window.print for PDF export', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    registerExportApi()

    await window.slidenerds.export({ format: 'pdf' })
    expect(printSpy).toHaveBeenCalled()

    printSpy.mockRestore()
  })

  it('should log info for PPTX export', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    registerExportApi()

    await window.slidenerds.export({ format: 'pptx' })
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('PPTX export triggered'),
    )

    infoSpy.mockRestore()
  })

  it('should log info for Google Slides export', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    registerExportApi()

    await window.slidenerds.export({ format: 'gslides' })
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining('Google Slides export triggered'),
    )

    infoSpy.mockRestore()
  })
})
