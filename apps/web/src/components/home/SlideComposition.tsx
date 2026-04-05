'use client'

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

const ACCENT = '#3ECF8E'
const BG = '#111114'
const SURFACE = '#1a1a1f'
const TEXT = '#e8e6e3'
const MUTED = '#888'

function SpringIn({ children, delay, style }: { children: React.ReactNode; delay: number; style?: React.CSSProperties }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } })
  const opacity = interpolate(progress, [0, 1], [0, 1])
  const y = interpolate(progress, [0, 1], [30, 0])

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
      height: 4,
      borderRadius: 2,
      background: ACCENT,
      transformOrigin: 'left',
      transform: `scaleX(${scaleX})`,
    }} />
  )
}

function FeatureCard({ title, desc, delay }: { title: string; desc: string; delay: number }) {
  return (
    <SpringIn delay={delay} style={{ flex: 1 }}>
      <div style={{
        background: SURFACE,
        borderRadius: 12,
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: ACCENT,
          marginBottom: 12,
        }} />
        <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </SpringIn>
  )
}

export function SlideComposition() {
  return (
    <AbsoluteFill style={{
      background: BG,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '60px 80px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}>
      <SpringIn delay={0}>
        <div style={{ fontSize: 11, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
          SlideNerds
        </div>
      </SpringIn>

      <SpringIn delay={8}>
        <div style={{ fontSize: 48, fontWeight: 700, color: TEXT, lineHeight: 1.15, marginBottom: 12 }}>
          Presentations are code
        </div>
      </SpringIn>

      <SpringIn delay={16}>
        <div style={{ fontSize: 20, color: MUTED, maxWidth: 560, lineHeight: 1.5, marginBottom: 8 }}>
          Build, version, and ship your decks with the tools you already use.
        </div>
      </SpringIn>

      <AccentBar delay={22} width="120px" />

      <div style={{ display: 'flex', gap: 16, marginTop: 40 }}>
        <FeatureCard
          title="AI-powered"
          desc="Use Claude, GPT, or any LLM to generate slides from a prompt."
          delay={28}
        />
        <FeatureCard
          title="18 built-in skills"
          desc="Layout, animation, data viz, diagrams, and more. All in your editor."
          delay={34}
        />
        <FeatureCard
          title="Ship anywhere"
          desc="Push to SlideNerds, deploy to Vercel, or export to PDF and PPTX."
          delay={40}
        />
      </div>
    </AbsoluteFill>
  )
}
