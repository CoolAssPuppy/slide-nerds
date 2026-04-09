'use client'

import React from 'react'
import { stagger } from './stagger.js'

export type SlideFrameBackground =
  | 'mesh-warm'
  | 'mesh-cool'
  | 'section'
  | 'plain'
  | 'none'

export type SlideFrameProps = {
  sectionLabel?: React.ReactNode
  title?: React.ReactNode
  subtitle?: React.ReactNode
  footerNote?: React.ReactNode
  background?: SlideFrameBackground
  maxWidth?: number | string
  headerGap?: number | string
  contentGap?: number | string
  padding?: string
  align?: 'center' | 'start'
  className?: string
  contentClassName?: string
  children?: React.ReactNode
}

const backgroundClass = (background: SlideFrameBackground): string => {
  switch (background) {
    case 'mesh-warm':
      return 'bg-mesh-warm'
    case 'mesh-cool':
      return 'bg-mesh-cool'
    case 'section':
      return 'bg-section'
    case 'plain':
    case 'none':
      return ''
  }
}

const toSize = (value: number | string | undefined, fallback: string): string => {
  if (value === undefined) return fallback
  if (typeof value === 'number') return `${value}px`
  return value
}

/**
 * Default centered slide scaffold: section label, title, subtitle, and a
 * content block, vertically and horizontally centered with sensible defaults
 * for padding, gap, and max-width. Use this for most content slides and only
 * reach for a custom layout when the content justifies it.
 */
export const SlideFrame: React.FC<SlideFrameProps> = ({
  sectionLabel,
  title,
  subtitle,
  footerNote,
  background = 'mesh-warm',
  maxWidth = 1400,
  headerGap = '1.5rem',
  contentGap = '4.5rem',
  padding = '5rem 6rem',
  align = 'center',
  className,
  contentClassName,
  children,
}) => {
  const alignItems = align === 'center' ? 'items-center' : 'items-start'
  const textAlign = align === 'center' ? 'text-center' : 'text-left'
  const bgClass = backgroundClass(background)

  const outerClassName = [
    'relative flex flex-col',
    alignItems,
    'justify-center w-full',
    bgClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={outerClassName} style={{ padding, minHeight: '100%' }}>
      <div
        className={`flex flex-col w-full ${alignItems}`}
        style={{ maxWidth: toSize(maxWidth, '1400px'), gap: toSize(contentGap, '4.5rem') }}
      >
        {(sectionLabel || title || subtitle) && (
          <div
            className={`flex flex-col ${alignItems} ${textAlign}`}
            style={{ gap: toSize(headerGap, '1.5rem') }}
          >
            {sectionLabel && (
              <p className="section-label auto-fade" style={stagger(0)}>
                {sectionLabel}
              </p>
            )}
            {title && (
              <h2
                className="text-[3.25rem] font-bold auto-slide-up"
                style={stagger(150)}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className="text-xl auto-fade"
                style={{
                  ...stagger(400),
                  color: 'var(--color-text-secondary, rgba(255,255,255,0.62))',
                  maxWidth: '66ch',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children && (
          <div className={contentClassName ?? 'w-full'}>{children}</div>
        )}

        {footerNote && (
          <p
            className="text-sm auto-fade"
            style={{
              ...stagger(600),
              color: 'var(--color-text-tertiary, rgba(255,255,255,0.38))',
            }}
          >
            {footerNote}
          </p>
        )}
      </div>
    </div>
  )
}
