'use client'

import Link from 'next/link'
import type { BrandConfig } from '@/lib/supabase/types'
import { parseBrandConfig } from '@/lib/brand'

type BrandCardProps = {
  brand: BrandConfig
}

export function BrandCard({ brand }: BrandCardProps) {
  const config = parseBrandConfig(brand.config)
  const { colors, fonts, spacing } = config

  const timeAgo = getTimeAgo(brand.updated_at)

  return (
    <Link
      href={`/brand/${brand.id}`}
      className="group block rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--primary)] transition-colors"
    >
      <div
        className="relative aspect-video overflow-hidden"
        style={{
          backgroundColor: colors.background,
          padding: `${Math.round(spacing.slide * 0.35)}px`,
        }}
      >
        <div
          className="h-full flex flex-col justify-between"
          style={{ gap: `${Math.round(spacing.section * 0.3)}px` }}
        >
          <div className="flex flex-col" style={{ gap: `${Math.round(spacing.element * 0.25)}px` }}>
            <h3
              className="text-[11px] font-bold leading-tight truncate"
              style={{ color: colors.text, fontFamily: fonts.heading }}
            >
              {brand.name || 'Brand name'}
            </h3>
            <p
              className="text-[7px] leading-relaxed line-clamp-2"
              style={{ color: colors.text, fontFamily: fonts.body, opacity: 0.7 }}
            >
              A sample slide with your brand colors and typography applied to headings, body text, and accents.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <div
              className="rounded-[3px] px-1.5 py-0.5"
              style={{ backgroundColor: colors.primary }}
            >
              <span
                className="text-[6px] font-semibold"
                style={{ color: colors.background, fontFamily: fonts.body }}
              >
                Primary
              </span>
            </div>
            <div
              className="rounded-[3px] px-1.5 py-0.5 border"
              style={{ borderColor: colors.accent }}
            >
              <span
                className="text-[6px] font-semibold"
                style={{ color: colors.accent, fontFamily: fonts.body }}
              >
                Accent
              </span>
            </div>
          </div>

          <div
            className="rounded-[3px] px-1.5 py-1"
            style={{ backgroundColor: colors.surface }}
          >
            <pre
              className="text-[5px] leading-relaxed"
              style={{ color: colors.text, fontFamily: fonts.mono, opacity: 0.8 }}
            >
              {'const brand = { primary: "' + colors.primary + '" }'}
            </pre>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {Object.entries(colors).map(([key, value]) => (
                <div
                  key={key}
                  className="w-3 h-3 rounded-full border border-black/10 shadow-sm"
                  style={{ backgroundColor: value }}
                  title={key}
                />
              ))}
            </div>
            {config.logo?.src && (
              <img
                src={config.logo.src}
                alt=""
                className="object-contain"
                style={{
                  width: Math.min(config.logo.width ?? 16, 20),
                  height: Math.min(config.logo.height ?? 16, 20),
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate">{brand.name}</h3>
          <span className="text-xs text-[var(--muted-foreground)] shrink-0 ml-2">
            {timeAgo}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[var(--muted-foreground)]">
          <span className="truncate" style={{ fontFamily: fonts.heading }}>{fonts.heading}</span>
          {fonts.heading !== fonts.body && (
            <>
              <span className="text-[var(--border)]">/</span>
              <span className="truncate" style={{ fontFamily: fonts.body }}>{fonts.body}</span>
            </>
          )}
          {fonts.mono !== 'JetBrains Mono' && (
            <>
              <span className="text-[var(--border)]">/</span>
              <span className="truncate" style={{ fontFamily: fonts.mono }}>{fonts.mono}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  )
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}
