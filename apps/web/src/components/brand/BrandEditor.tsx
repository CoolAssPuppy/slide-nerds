'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { Json } from '@/lib/supabase/database.types'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { parseBrandConfig } from '@/lib/brand'
import type { BrandConfigData } from '@/lib/brand'
import type { BrandConfig } from '@/lib/supabase/types'

type BrandEditorProps = {
  brand: BrandConfig
}

const COLOR_FIELDS = [
  { key: 'primary' as const, label: 'Primary', hint: 'Buttons, links, accents' },
  { key: 'accent' as const, label: 'Accent', hint: 'Secondary highlights' },
  { key: 'background' as const, label: 'Background', hint: 'Slide background' },
  { key: 'surface' as const, label: 'Surface', hint: 'Cards, panels' },
  { key: 'text' as const, label: 'Text', hint: 'Body text color' },
]

const FONT_FIELDS = [
  { key: 'heading' as const, label: 'Heading font', placeholder: 'Inter' },
  { key: 'body' as const, label: 'Body font', placeholder: 'Inter' },
  { key: 'mono' as const, label: 'Monospace font', placeholder: 'JetBrains Mono' },
]

const SPACING_FIELDS = [
  { key: 'slide' as const, label: 'Slide padding', hint: 'px' },
  { key: 'section' as const, label: 'Section gap', hint: 'px' },
  { key: 'element' as const, label: 'Element gap', hint: 'px' },
]

export function BrandEditor({ brand }: BrandEditorProps) {
  const initial = parseBrandConfig(brand.config)
  const [name, setName] = useState(brand.name)
  const [config, setConfig] = useState<BrandConfigData>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const updateColor = (key: keyof BrandConfigData['colors'], value: string) => {
    setConfig({ ...config, colors: { ...config.colors, [key]: value } })
  }

  const updateFont = (key: keyof BrandConfigData['fonts'], value: string) => {
    setConfig({ ...config, fonts: { ...config.fonts, [key]: value } })
  }

  const updateSpacing = (key: keyof BrandConfigData['spacing'], value: number) => {
    setConfig({ ...config, spacing: { ...config.spacing, [key]: value } })
  }

  const updateLogo = (field: string, value: string | number) => {
    const current = config.logo ?? { src: '' }
    setConfig({ ...config, logo: { ...current, [field]: value } })
  }

  const handleSave = async () => {
    setSaving(true)

    const payload = config.logo?.src
      ? config
      : { colors: config.colors, fonts: config.fonts, spacing: config.spacing }

    await supabase
      .from('brand_configs')
      .update({
        name,
        config: payload as unknown as Json,
      })
      .eq('id', brand.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const { colors, fonts, spacing } = config
  const inputClass =
    'w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/brand"
          className="flex items-center justify-center w-8 h-8 rounded-[var(--n-radius-md)] hover:bg-[var(--accent)] transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-2xl font-bold bg-transparent border-none outline-none w-full"
            placeholder="Brand name"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saved ? 'Saved' : saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ColorSection
            colors={colors}
            onUpdate={updateColor}
            inputClass={inputClass}
          />
          <FontSection
            fonts={fonts}
            onUpdate={updateFont}
            inputClass={inputClass}
          />
          <SpacingSection
            spacing={spacing}
            onUpdate={updateSpacing}
            inputClass={inputClass}
          />
          <LogoSection
            logo={config.logo}
            onUpdate={updateLogo}
            inputClass={inputClass}
          />
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <BrandPreview config={config} name={name} />
        </div>
      </div>
    </div>
  )
}

type ColorSectionProps = {
  colors: BrandConfigData['colors']
  onUpdate: (key: keyof BrandConfigData['colors'], value: string) => void
  inputClass: string
}

function ColorSection({ colors, onUpdate, inputClass }: ColorSectionProps) {
  return (
    <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
      <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        Colors
      </h2>
      <div className="space-y-3">
        {COLOR_FIELDS.map(({ key, label, hint }) => (
          <div key={key} className="flex items-center gap-3">
            <label
              htmlFor={`color-edit-${key}`}
              className="relative w-10 h-10 rounded-[var(--n-radius-md)] border border-[var(--border)] overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--ring)] transition-shadow shrink-0"
              style={{ backgroundColor: colors[key] }}
            >
              <input
                id={`color-edit-${key}`}
                type="color"
                value={colors[key]}
                onChange={(e) => onUpdate(key, e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{label}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{hint}</span>
              </div>
              <input
                type="text"
                value={colors[key]}
                onChange={(e) => onUpdate(key, e.target.value)}
                className={inputClass}
                style={{ marginTop: '4px' }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

type FontSectionProps = {
  fonts: BrandConfigData['fonts']
  onUpdate: (key: keyof BrandConfigData['fonts'], value: string) => void
  inputClass: string
}

function FontSection({ fonts, onUpdate, inputClass }: FontSectionProps) {
  return (
    <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
      <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        Fonts
      </h2>
      <div className="space-y-3">
        {FONT_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label htmlFor={`font-${key}`} className="block text-sm font-medium mb-1">
              {label}
            </label>
            <input
              id={`font-${key}`}
              type="text"
              value={fonts[key]}
              onChange={(e) => onUpdate(key, e.target.value)}
              placeholder={placeholder}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

type SpacingSectionProps = {
  spacing: BrandConfigData['spacing']
  onUpdate: (key: keyof BrandConfigData['spacing'], value: number) => void
  inputClass: string
}

function SpacingSection({ spacing, onUpdate, inputClass }: SpacingSectionProps) {
  return (
    <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
      <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        Spacing
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {SPACING_FIELDS.map(({ key, label, hint }) => (
          <div key={key}>
            <label htmlFor={`spacing-${key}`} className="block text-sm font-medium mb-1">
              {label}
            </label>
            <div className="relative">
              <input
                id={`spacing-${key}`}
                type="number"
                value={spacing[key]}
                onChange={(e) => onUpdate(key, parseInt(e.target.value, 10) || 0)}
                min={0}
                className={inputClass}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)] pointer-events-none">
                {hint}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

type LogoSectionProps = {
  logo: BrandConfigData['logo']
  onUpdate: (field: string, value: string | number) => void
  inputClass: string
}

function LogoSection({ logo, onUpdate, inputClass }: LogoSectionProps) {
  return (
    <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
      <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        Logo (optional)
      </h2>
      <div>
        <label htmlFor="logo-src" className="block text-sm font-medium mb-1">
          Logo URL
        </label>
        <input
          id="logo-src"
          type="url"
          value={logo?.src ?? ''}
          onChange={(e) => onUpdate('src', e.target.value)}
          placeholder="https://example.com/logo.svg"
          className={inputClass}
        />
      </div>
      {logo?.src && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="logo-width" className="block text-sm font-medium mb-1">
              Width
            </label>
            <input
              id="logo-width"
              type="number"
              value={logo?.width ?? ''}
              onChange={(e) => onUpdate('width', parseInt(e.target.value, 10) || 0)}
              placeholder="Auto"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="logo-height" className="block text-sm font-medium mb-1">
              Height
            </label>
            <input
              id="logo-height"
              type="number"
              value={logo?.height ?? ''}
              onChange={(e) => onUpdate('height', parseInt(e.target.value, 10) || 0)}
              placeholder="Auto"
              className={inputClass}
            />
          </div>
        </div>
      )}
    </section>
  )
}

type BrandPreviewProps = {
  config: BrandConfigData
  name: string
}

function BrandPreview({ config, name }: BrandPreviewProps) {
  const { colors, fonts, spacing } = config

  return (
    <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
      <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        Preview
      </h2>

      <div
        className="rounded-[var(--n-radius-lg)] overflow-hidden shadow-lg"
        style={{
          backgroundColor: colors.background,
          padding: `${spacing.slide}px`,
          aspectRatio: '16 / 9',
        }}
      >
        <div
          className="h-full flex flex-col justify-between"
          style={{ gap: `${spacing.section}px` }}
        >
          <div style={{ gap: `${spacing.element}px` }} className="flex flex-col">
            <h3
              className="text-xl font-bold leading-tight"
              style={{ color: colors.text, fontFamily: fonts.heading }}
            >
              {name || 'Brand name'}
            </h3>
            <p
              className="text-xs leading-relaxed"
              style={{ color: colors.text, fontFamily: fonts.body, opacity: 0.7 }}
            >
              A sample slide with your brand colors and fonts applied. This shows how
              headings, body text, and accent elements look together.
            </p>
          </div>

          <div className="flex items-center" style={{ gap: `${spacing.element}px` }}>
            <div
              className="rounded-[6px] px-3 py-1.5"
              style={{ backgroundColor: colors.primary }}
            >
              <span
                className="text-[10px] font-semibold"
                style={{ color: colors.background, fontFamily: fonts.body }}
              >
                Primary button
              </span>
            </div>
            <div
              className="rounded-[6px] px-3 py-1.5 border"
              style={{ borderColor: colors.accent }}
            >
              <span
                className="text-[10px] font-semibold"
                style={{ color: colors.accent, fontFamily: fonts.body }}
              >
                Accent button
              </span>
            </div>
          </div>

          <div
            className="rounded-[var(--n-radius-md)] p-3"
            style={{ backgroundColor: colors.surface }}
          >
            <pre
              className="text-[9px] leading-relaxed"
              style={{ color: colors.text, fontFamily: fonts.mono, opacity: 0.8 }}
            >
              {'const brand = {\n  primary: "' + colors.primary + '",\n  accent: "' + colors.accent + '"\n}'}
            </pre>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {Object.entries(colors).map(([key, value]) => (
                <div
                  key={key}
                  className="w-5 h-5 rounded-full border border-black/10"
                  style={{ backgroundColor: value }}
                  title={key}
                />
              ))}
            </div>
            {config.logo?.src && (
              <img
                src={config.logo.src}
                alt="Logo"
                className="object-contain"
                style={{
                  width: config.logo.width ?? 32,
                  height: config.logo.height ?? 32,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
