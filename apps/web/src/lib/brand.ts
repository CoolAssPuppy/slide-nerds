import type { Json } from './supabase/database.types'

export type BrandColors = {
  primary: string
  accent: string
  background: string
  surface: string
  text: string
}

export type BrandFonts = {
  heading: string
  body: string
  mono: string
}

export type BrandSpacing = {
  slide: number
  section: number
  element: number
}

export type BrandLogo = {
  src: string
  width?: number
  height?: number
}

export type BrandConfigData = {
  colors: BrandColors
  fonts: BrandFonts
  spacing: BrandSpacing
  logo?: BrandLogo
}

export const DEFAULT_BRAND_CONFIG: BrandConfigData = {
  colors: {
    primary: '#3ECF8E',
    accent: '#6C63FF',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#1A1A2E',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  spacing: {
    slide: 64,
    section: 32,
    element: 16,
  },
}

export const parseBrandConfig = (json: Json): BrandConfigData => {
  const raw = json as Record<string, unknown>
  const colors = (raw.colors ?? DEFAULT_BRAND_CONFIG.colors) as BrandColors
  const fonts = (raw.fonts ?? DEFAULT_BRAND_CONFIG.fonts) as BrandFonts
  const spacing = (raw.spacing ?? DEFAULT_BRAND_CONFIG.spacing) as BrandSpacing
  const logo = raw.logo as BrandLogo | undefined

  return { colors, fonts, spacing, logo }
}
