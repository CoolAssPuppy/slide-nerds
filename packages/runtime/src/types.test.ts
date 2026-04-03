import { describe, it, expect } from 'vitest'
import { BrandConfigSchema } from './types'

const getValidBrandConfig = (overrides?: Record<string, unknown>) => ({
  colors: {
    primary: '#1a1a2e',
    accent: '#e94560',
    background: '#0f3460',
    surface: '#16213e',
    text: '#eaeaea',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  spacing: {
    slide: '4rem',
    section: '2rem',
    element: '1rem',
  },
  ...overrides,
})

describe('BrandConfigSchema', () => {
  it('should accept a valid brand config', () => {
    const config = getValidBrandConfig()
    const result = BrandConfigSchema.safeParse(config)
    expect(result.success).toBe(true)
  })

  it('should accept a config with tailwind extend', () => {
    const config = getValidBrandConfig({
      tailwind: {
        extend: {
          colors: { brand: '#e94560' },
        },
      },
    })
    const result = BrandConfigSchema.safeParse(config)
    expect(result.success).toBe(true)
  })

  it('should reject a config missing required color fields', () => {
    const config = getValidBrandConfig({
      colors: { primary: '#1a1a2e' },
    })
    const result = BrandConfigSchema.safeParse(config)
    expect(result.success).toBe(false)
  })

  it('should reject a config missing fonts', () => {
    const { fonts: _fonts, ...rest } = getValidBrandConfig()
    const result = BrandConfigSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('should accept a config without tailwind section', () => {
    const config = getValidBrandConfig()
    const result = BrandConfigSchema.safeParse(config)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tailwind).toBeUndefined()
    }
  })
})
