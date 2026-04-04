'use client'

import React, { useId } from 'react'

export type ShapeType =
  | 'circle'
  | 'square'
  | 'rounded-square'
  | 'triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'star'
  | 'plus'
  | 'cloud'
  | 'arrow-right'
  | 'arrow-left'
  | 'chevron-right'
  | 'pill'

type SlideShapeProps = {
  shape: ShapeType
  size?: number
  width?: number
  height?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  imageSrc?: string
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  'data-magic-id'?: string
  'data-step'?: string
}

const r2 = (n: number): number => Math.round(n * 100) / 100

const SHAPE_PATHS: Record<ShapeType, (w: number, h: number) => string> = {
  circle: (w, h) => {
    const rx = w / 2
    const ry = h / 2
    return `M ${rx},0 A ${rx},${ry} 0 1,1 ${rx},${h} A ${rx},${ry} 0 1,1 ${rx},0 Z`
  },
  square: (w, h) => `M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z`,
  'rounded-square': (w, h) => {
    const r = Math.min(w, h) * 0.12
    return `M ${r},0 L ${w - r},0 Q ${w},0 ${w},${r} L ${w},${h - r} Q ${w},${h} ${w - r},${h} L ${r},${h} Q 0,${h} 0,${h - r} L 0,${r} Q 0,0 ${r},0 Z`
  },
  triangle: (w, h) => `M ${w / 2},0 L ${w},${h} L 0,${h} Z`,
  diamond: (w, h) => `M ${w / 2},0 L ${w},${h / 2} L ${w / 2},${h} L 0,${h / 2} Z`,
  pentagon: (w, h) => {
    const cx = w / 2
    const cy = h / 2
    const rad = Math.min(cx, cy)
    const pts = Array.from({ length: 5 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
      return `${r2(cx + rad * Math.cos(angle))},${r2(cy + rad * Math.sin(angle))}`
    })
    return `M ${pts.join(' L ')} Z`
  },
  hexagon: (w, h) => {
    const cx = w / 2
    const cy = h / 2
    const rad = Math.min(cx, cy)
    const pts = Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 6
      return `${r2(cx + rad * Math.cos(angle))},${r2(cy + rad * Math.sin(angle))}`
    })
    return `M ${pts.join(' L ')} Z`
  },
  octagon: (w, h) => {
    const cx = w / 2
    const cy = h / 2
    const rad = Math.min(cx, cy)
    const pts = Array.from({ length: 8 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 8 - Math.PI / 8
      return `${r2(cx + rad * Math.cos(angle))},${r2(cy + rad * Math.sin(angle))}`
    })
    return `M ${pts.join(' L ')} Z`
  },
  star: (w, h) => {
    const cx = w / 2
    const cy = h / 2
    const outer = Math.min(cx, cy)
    const inner = outer * 0.4
    const pts = Array.from({ length: 10 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 10 - Math.PI / 2
      const rad = i % 2 === 0 ? outer : inner
      return `${r2(cx + rad * Math.cos(angle))},${r2(cy + rad * Math.sin(angle))}`
    })
    return `M ${pts.join(' L ')} Z`
  },
  plus: (w, h) => {
    const t = Math.min(w, h) * 0.3
    const cx = w / 2
    const cy = h / 2
    return `M ${cx - t / 2},0 L ${cx + t / 2},0 L ${cx + t / 2},${cy - t / 2} L ${w},${cy - t / 2} L ${w},${cy + t / 2} L ${cx + t / 2},${cy + t / 2} L ${cx + t / 2},${h} L ${cx - t / 2},${h} L ${cx - t / 2},${cy + t / 2} L 0,${cy + t / 2} L 0,${cy - t / 2} L ${cx - t / 2},${cy - t / 2} Z`
  },
  cloud: (w, h) => {
    const cx = w / 2
    return `M ${r2(w * 0.2)},${r2(h * 0.65)} A ${r2(w * 0.2)},${r2(w * 0.2)} 0 1,1 ${r2(w * 0.35)},${r2(h * 0.35)} A ${r2(w * 0.18)},${r2(w * 0.18)} 0 1,1 ${r2(cx)},${r2(h * 0.2)} A ${r2(w * 0.2)},${r2(w * 0.2)} 0 1,1 ${r2(w * 0.7)},${r2(h * 0.3)} A ${r2(w * 0.18)},${r2(w * 0.18)} 0 1,1 ${r2(w * 0.85)},${r2(h * 0.55)} A ${r2(w * 0.15)},${r2(w * 0.15)} 0 1,1 ${r2(w * 0.75)},${r2(h * 0.75)} L ${r2(w * 0.25)},${r2(h * 0.75)} A ${r2(w * 0.12)},${r2(w * 0.12)} 0 1,1 ${r2(w * 0.2)},${r2(h * 0.65)} Z`
  },
  'arrow-right': (w, h) => {
    const shaft = h * 0.3
    const cy = h / 2
    return `M 0,${cy - shaft / 2} L ${w * 0.6},${cy - shaft / 2} L ${w * 0.6},0 L ${w},${cy} L ${w * 0.6},${h} L ${w * 0.6},${cy + shaft / 2} L 0,${cy + shaft / 2} Z`
  },
  'arrow-left': (w, h) => {
    const shaft = h * 0.3
    const cy = h / 2
    return `M ${w},${cy - shaft / 2} L ${w * 0.4},${cy - shaft / 2} L ${w * 0.4},0 L 0,${cy} L ${w * 0.4},${h} L ${w * 0.4},${cy + shaft / 2} L ${w},${cy + shaft / 2} Z`
  },
  'chevron-right': (w, h) => {
    const t = w * 0.35
    return `M 0,0 L ${w},${h / 2} L 0,${h} L ${t},${h / 2} Z`
  },
  pill: (w, h) => {
    const r = h / 2
    return `M ${r},0 L ${w - r},0 A ${r},${r} 0 1,1 ${w - r},${h} L ${r},${h} A ${r},${r} 0 1,1 ${r},0 Z`
  },
}

export const SlideShape: React.FC<SlideShapeProps> = ({
  shape,
  size,
  width: widthProp,
  height: heightProp,
  fill = 'var(--color-surface)',
  stroke = 'var(--color-border)',
  strokeWidth = 1,
  opacity,
  imageSrc,
  children,
  className,
  style,
  ...rest
}) => {
  const clipId = useId()
  const w = widthProp ?? size ?? 120
  const h = heightProp ?? size ?? 120
  const pathFn = SHAPE_PATHS[shape]
  const d = pathFn(w, h)

  const dataAttrs: Record<string, string | undefined> = {}
  if (rest['data-magic-id']) dataAttrs['data-magic-id'] = rest['data-magic-id']
  if (rest['data-step'] !== undefined) dataAttrs['data-step'] = rest['data-step']

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: w,
        height: h,
        ...style,
      }}
      {...dataAttrs}
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0 }}
      >
        {imageSrc && (
          <defs>
            <clipPath id={clipId}>
              <path d={d} />
            </clipPath>
          </defs>
        )}

        {imageSrc ? (
          <image
            href={imageSrc}
            x={0}
            y={0}
            width={w}
            height={h}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        ) : (
          <path
            d={d}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )}

        {imageSrc && stroke !== 'none' && (
          <path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            opacity={opacity}
          />
        )}
      </svg>

      {children && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '15%',
            textAlign: 'center',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
