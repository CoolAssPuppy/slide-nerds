'use client'

import React from 'react'

export type IconComponent = React.ComponentType<{
  size?: number | string
  strokeWidth?: number | string
  color?: string
  className?: string
  style?: React.CSSProperties
}>

type IconProps = {
  as: IconComponent
  size?: number | string
  strokeWidth?: number | string
  color?: string
  className?: string
  style?: React.CSSProperties
  label?: string
}

/**
 * Thin wrapper around a Lucide icon component (or any component with the
 * same prop shape) that applies slide-appropriate defaults: strokeWidth 1.75
 * for projection legibility, size 20, and currentColor so icons inherit the
 * surrounding text color. Pass `label` to announce the icon to screen readers.
 *
 * @example
 *   import { Target } from 'lucide-react'
 *   <Icon as={Target} size={32} label="Goal" />
 */
export const Icon: React.FC<IconProps> = ({
  as: Component,
  size = 20,
  strokeWidth = 1.75,
  color = 'currentColor',
  className,
  style,
  label,
}) => {
  return (
    <span
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <Component
        size={size}
        strokeWidth={strokeWidth}
        color={color}
        className={className}
      />
    </span>
  )
}

type LogoProps = {
  size?: number | string
  color?: string
  className?: string
  style?: React.CSSProperties
  label?: string
}

/**
 * The Model Context Protocol wordmark glyph: three interlocking arcs
 * rendered as an inline SVG so no extra asset pipeline is needed.
 */
export const McpLogo: React.FC<LogoProps> = ({
  size = 24,
  color = 'currentColor',
  className,
  style,
  label = 'Model Context Protocol',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      stroke={color}
      strokeWidth={12}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'inline-block', ...style }}
      role="img"
      aria-label={label}
    >
      <path d="M25 142 Q100 -18 175 142" />
      <path d="M25 178 Q100 18 175 178" />
      <path d="M60 178 Q135 18 210 178" transform="translate(-35 0)" />
    </svg>
  )
}

/**
 * Bot glyph matching the Lucide `Bot` icon shape but shipped as a
 * first-class component so AI decks don't need to install lucide-react
 * just to place a bot avatar.
 */
export const BotIcon: React.FC<LogoProps> = ({
  size = 24,
  color = 'currentColor',
  className,
  style,
  label = 'Bot',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'inline-block', ...style }}
      role="img"
      aria-label={label}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}
