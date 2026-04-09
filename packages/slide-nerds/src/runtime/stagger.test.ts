import { describe, it, expect } from 'vitest'
import { stagger } from './stagger'

describe('stagger', () => {
  it('should return a style object with --stagger set to ms when given a number', () => {
    const style = stagger(300) as Record<string, string>
    expect(style['--stagger']).toBe('300ms')
  })

  it('should pass string delays through unchanged', () => {
    const style = stagger('0.75s') as Record<string, string>
    expect(style['--stagger']).toBe('0.75s')
  })

  it('should support zero delay', () => {
    const style = stagger(0) as Record<string, string>
    expect(style['--stagger']).toBe('0ms')
  })
})
