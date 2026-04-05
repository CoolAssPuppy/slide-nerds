'use client'

import Link from 'next/link'
import type { BrandConfig } from '@/lib/supabase/types'
import { parseBrandConfig } from '@/lib/brand'

type BrandCardProps = {
  brand: BrandConfig
}

export function BrandCard({ brand }: BrandCardProps) {
  const config = parseBrandConfig(brand.config)
  const { colors, fonts } = config

  const timeAgo = getTimeAgo(brand.updated_at)

  return (
    <Link
      href={`/brand/${brand.id}`}
      className="group block rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:border-[var(--primary)] transition-colors"
    >
      <div
        className="relative aspect-video overflow-hidden"
        style={{ backgroundColor: colors.background }}
      >
        <div className="absolute inset-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div
              className="rounded-[6px] px-3 py-1.5"
              style={{ backgroundColor: colors.primary }}
            >
              <span
                className="text-[10px] font-bold tracking-wide uppercase"
                style={{ color: colors.background, fontFamily: fonts.heading }}
              >
                Heading
              </span>
            </div>
            <div
              className="w-8 h-8 rounded-full"
              style={{ backgroundColor: colors.accent }}
            />
          </div>

          <div className="space-y-2">
            <div
              className="h-2 rounded-full w-3/4"
              style={{ backgroundColor: colors.text, opacity: 0.8 }}
            />
            <div
              className="h-1.5 rounded-full w-1/2"
              style={{ backgroundColor: colors.text, opacity: 0.4 }}
            />
            <div
              className="h-1.5 rounded-full w-2/3"
              style={{ backgroundColor: colors.text, opacity: 0.4 }}
            />
          </div>

          <div className="flex items-end justify-between">
            <div
              className="rounded-[4px] px-2 py-1"
              style={{ backgroundColor: colors.surface }}
            >
              <span
                className="text-[8px]"
                style={{ color: colors.text, fontFamily: fonts.body }}
              >
                Body text
              </span>
            </div>
            <div className="flex gap-1">
              {Object.entries(colors).map(([key, value]) => (
                <div
                  key={key}
                  className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                  style={{ backgroundColor: value }}
                  title={key}
                />
              ))}
            </div>
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
        <div className="flex items-center gap-3 mt-1.5">
          <span
            className="text-xs text-[var(--muted-foreground)] truncate"
            title={fonts.heading}
          >
            {fonts.heading}
          </span>
          {fonts.heading !== fonts.body && (
            <>
              <span className="text-[var(--border)]">/</span>
              <span
                className="text-xs text-[var(--muted-foreground)] truncate"
                title={fonts.body}
              >
                {fonts.body}
              </span>
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
