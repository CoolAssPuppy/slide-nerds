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
      width: 20,
      height: h,
      borderRadius: '3px 3px 0 0',
      background: color,
    }} />
  )
}

function StatCard({ label, value, delay }: { label: string; value: number; delay: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const opacity = interpolate(spring({ frame: frame - delay, fps, config: { damping: 14 } }), [0, 1], [0, 1])

  return (
    <div style={{ opacity, flex: 1, padding: '10px 12px', background: '#0f0f11', borderRadius: 6, border: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>
        <AnimatedNumber value={value} delay={delay + 4} />
      </div>
    </div>
  )
}

export function AnalyticsComposition() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Panel slides in from right at frame 20
  const panelProgress = spring({ frame: frame - 20, fps, config: { damping: 16, stiffness: 90 } })
  const panelX = interpolate(panelProgress, [0, 1], [240, 0])
  const panelOpacity = interpolate(panelProgress, [0, 1], [0, 1])

  const barHeights = [30, 50, 40, 65, 75, 55, 85, 68, 80, 95, 72, 105]
  const barDelays = barHeights.map((_, i) => 35 + i * 2)

  return (
    <AbsoluteFill style={{
      background: BG,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Full-width slide background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        padding: '48px 64px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
          SlideNerds
        </div>
        <div style={{ fontSize: 36, fontWeight: 700, color: TEXT, lineHeight: 1.15, marginBottom: 10 }}>
          Presentations are code
        </div>
        <div style={{ fontSize: 16, color: MUTED, maxWidth: 420, lineHeight: 1.5, marginBottom: 24 }}>
          Build, version, and ship your decks with the tools you already use.
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {['AI-powered', '18 skills', 'Ship anywhere'].map((t) => (
            <div key={t} style={{
              fontSize: 11,
              color: MUTED,
              background: SURFACE,
              padding: '8px 14px',
              borderRadius: 8,
              border: `1px solid ${BORDER}`,
            }}>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 240,
        transform: `translateX(${panelX}px)`,
        opacity: panelOpacity,
        background: SURFACE,
        borderLeft: `1px solid ${BORDER}`,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: TEXT }}>Analytics</div>

        <div style={{ display: 'flex', gap: 6 }}>
          <StatCard label="Views" value={2847} delay={28} />
          <StatCard label="Unique" value={891} delay={32} />
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <StatCard label="Avg time" value={42} delay={36} />
          <StatCard label="Shares" value={18} delay={40} />
        </div>

        {/* Bar chart */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Views over time</div>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 4,
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

        {/* Recent viewers */}
        <div>
          <div style={{ fontSize: 9, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Recent viewers</div>
          <div style={{ display: 'flex' }}>
            {[0, 1, 2, 3, 4].map((i) => {
              const dotProgress = spring({ frame: frame - (55 + i * 3), fps, config: { damping: 12 } })
              const scale = interpolate(dotProgress, [0, 1], [0, 1])
              return (
                <div key={i} style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `hsl(${160 + i * 30}, 50%, ${40 + i * 5}%)`,
                  border: `2px solid ${SURFACE}`,
                  transform: `scale(${scale})`,
                  marginLeft: i > 0 ? -4 : 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
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
