import type { CSSProperties } from 'react'

const toCssTime = (value: number | string): string => {
  return typeof value === 'number' ? `${value}ms` : value
}

/**
 * Apply a staggered delay to any auto-* entrance animation by setting the
 * `--stagger` CSS custom property that the template's global CSS reads from
 * both transition-delay and animation-delay.
 *
 * @example
 *   <div className="auto-slide-up" style={stagger(200)}>...</div>
 */
export const stagger = (delay: number | string): CSSProperties => {
  return { '--stagger': toCssTime(delay) } as CSSProperties
}
