import { describe, it, expect, beforeEach } from 'vitest'
import { registerExportApi } from './export-api'

describe('registerExportApi', () => {
  beforeEach(() => {
    delete (window as unknown as Record<string, unknown>).slidenerds
  })

  it('should register slidenerds object on window', () => {
    registerExportApi()
    expect(window.slidenerds).toBeDefined()
    expect(typeof window.slidenerds.export).toBe('function')
  })

  it('should accept pdf format', () => {
    registerExportApi()
    expect(() => window.slidenerds.export({ format: 'pdf' })).not.toThrow()
  })

  it('should accept pptx format', () => {
    registerExportApi()
    expect(() => window.slidenerds.export({ format: 'pptx' })).not.toThrow()
  })
})
