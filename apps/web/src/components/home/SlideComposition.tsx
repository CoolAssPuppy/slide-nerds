'use client'

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

const ACCENT = '#3ECF8E'
const BG = '#111114'
const SURFACE = '#1a1a1f'
const TEXT = '#e8e6e3'
const MUTED = '#888'
const BORDER = 'rgba(255,255,255,0.06)'

function SpringIn({ children, delay, style }: { children: React.ReactNode; delay: number; style?: React.CSSProperties }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } })
  const opacity = interpolate(progress, [0, 1], [0, 1])
  const y = interpolate(progress, [0, 1], [24, 0])

  return (
    <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>
      {children}
    </div>
  )
}

function AccentBar({ delay, width }: { delay: number; width: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 100 } })
  const scaleX = interpolate(progress, [0, 1], [0, 1])

  return (
    <div style={{
      width,
      height: 3,
      borderRadius: 2,
      background: ACCENT,
      transformOrigin: 'left',
      transform: `scaleX(${scaleX})`,
    }} />
  )
}

function StepCard({ number, title, code, delay }: { number: string; title: string; code: string; delay: number }) {
  return (
    <SpringIn delay={delay} style={{ flex: 1 }}>
      <div style={{
        background: SURFACE,
        borderRadius: 12,
        padding: '20px',
        border: `1px solid ${BORDER}`,
        height: '100%',
      }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: ACCENT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: BG,
          marginBottom: 12,
        }}>
          {number}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 8 }}>{title}</div>
        <div style={{
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          color: ACCENT,
          background: '#0d0d0f',
          padding: '6px 10px',
          borderRadius: 6,
          border: `1px solid ${BORDER}`,
        }}>
          {code}
        </div>
      </div>
    </SpringIn>
  )
}

export function SlideComposition() {
  return (
    <AbsoluteFill style={{
      background: BG,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '48px 64px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <SpringIn delay={0}>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          color: ACCENT,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          SlideNerds
        </div>
      </SpringIn>

      <SpringIn delay={8}>
        <div style={{ fontSize: 42, fontWeight: 700, color: TEXT, lineHeight: 1.15, marginBottom: 10 }}>
          Build slides like you build code
        </div>
      </SpringIn>

      <SpringIn delay={16}>
        <div style={{ fontSize: 17, color: MUTED, maxWidth: 520, lineHeight: 1.5, marginBottom: 6 }}>
          Open source. LLM-powered. Ship from your terminal.
        </div>
      </SpringIn>

      <AccentBar delay={22} width="100px" />

      <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>
        <StepCard
          number="1"
          title="Create"
          code="slidenerds create my-talk"
          delay={28}
        />
        <StepCard
          number="2"
          title="Build with AI"
          code="claude"
          delay={34}
        />
        <StepCard
          number="3"
          title="Push"
          code="slidenerds push"
          delay={40}
        />
      </div>
    </AbsoluteFill>
  )
}
