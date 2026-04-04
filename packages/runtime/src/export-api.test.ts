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

  it('should expose an export function that accepts format options', () => {
    registerExportApi()
    const fn = window.slidenerds.export
    expect(fn.length).toBe(1)
  })
})
