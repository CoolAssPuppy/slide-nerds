'use client'

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

const ACCENT = '#3ECF8E'
const BG = '#111114'
const SURFACE = '#1a1a1f'
const TEXT = '#e8e6e3'
const MUTED = '#888'
const BORDER = 'rgba(255,255,255,0.06)'

function AnimatedNumber({ value, delay }: { value: number; delay: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 80 } })
  const displayValue = Math.round(interpolate(progress, [0, 1], [0, value]))

  return <>{displayValue.toLocaleString()}</>
}

function AnimatedBar({ height, delay, color }: { height: number; delay: number; color: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const progress = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 100 } })
  const h = interpolate(progress, [0, 1], [0, height])

  return (
    <div style={{
      width: 28,
      height: h,
      borderRadius: '4px 4px 0 0',
      background: color,
    }} />
  )
}

function StatCard({ label, value, delay }: { label: string; value: number; delay: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = interpolate(spring({ frame: frame - delay, fps, config: { damping: 14 } }), [0, 1], [0, 1])

  return (
    <div style={{ opacity, flex: 1, padding: '14px 16px', background: SURFACE, borderRadius: 8, border: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: TEXT }}>
        <AnimatedNumber value={value} delay={delay + 4} />
      </div>
    </div>
  )
}

function MiniSlide() {
  return (
    <div style={{
      background: BG,
      borderRadius: 8,
      padding: '28px 36px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: '100%',
      border: `1px solid ${BORDER}`,
    }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
        SlideNerds
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: TEXT, lineHeight: 1.2, marginBottom: 8 }}>
        Presentations are code
      </div>
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 16 }}>
        Build, version, and ship your decks.
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {['AI-powered', 'Skills', 'Ship anywhere'].map((t) => (
          <div key={t} style={{ fontSize: 10, color: MUTED, background: SURFACE, padding: '6px 10px', borderRadius: 6, border: `1px solid ${BORDER}` }}>
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnalyticsComposition() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Slide shrinks and moves left over frames 0-20
  const slideScale = interpolate(frame, [0, 20], [1, 0.55], { extrapolateRight: 'clamp' })
  const slideX = interpolate(frame, [0, 20], [0, -20], { extrapolateRight: 'clamp' })

  // Panel slides in from right at frame 15
  const panelProgress = spring({ frame: frame - 15, fps, config: { damping: 16, stiffness: 90 } })
  const panelX = interpolate(panelProgress, [0, 1], [300, 0])
  const panelOpacity = interpolate(panelProgress, [0, 1], [0, 1])

  const barHeights = [40, 65, 50, 80, 95, 70, 110, 85, 100, 120, 90, 130]
  const barDelays = barHeights.map((_, i) => 30 + i * 2)

  return (
    <AbsoluteFill style={{
      background: '#0c0c0e',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      padding: 24,
      gap: 16,
    }}>
      {/* Slide preview */}
      <div style={{
        flex: '0 0 55%',
        transform: `scale(${slideScale}) translateX(${slideX}px)`,
        transformOrigin: 'center left',
      }}>
        <MiniSlide />
      </div>

      {/* Analytics panel */}
      <div style={{
        flex: 1,
        transform: `translateX(${panelX}px)`,
        opacity: panelOpacity,
        background: SURFACE,
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflow: 'hidden',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Analytics</div>

        <div style={{ display: 'flex', gap: 8 }}>
          <StatCard label="Views" value={2847} delay={22} />
          <StatCard label="Unique" value={891} delay={26} />
          <StatCard label="Avg time" value={42} delay={30} />
        </div>

        {/* Bar chart */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Views over time</div>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 6,
            padding: '0 4px',
          }}>
            {barHeights.map((h, i) => (
              <AnimatedBar
                key={i}
                height={h}
                delay={barDelays[i]}
                color={i === barHeights.length - 1 ? ACCENT : 'rgba(62, 207, 142, 0.3)'}
              />
            ))}
          </div>
        </div>

        {/* Recent views dots */}
        <div>
          <div style={{ fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Recent viewers</div>
          <div style={{ display: 'flex', gap: -4 }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const dotProgress = spring({ frame: frame - (50 + i * 3), fps, config: { damping: 12 } })
              const scale = interpolate(dotProgress, [0, 1], [0, 1])
              return (
                <div key={i} style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: `hsl(${160 + i * 30}, 50%, ${40 + i * 5}%)`,
                  border: `2px solid ${SURFACE}`,
                  transform: `scale(${scale})`,
                  marginLeft: i > 0 ? -6 : 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: TEXT,
                }}>
                  {String.fromCharCode(65 + i)}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}
