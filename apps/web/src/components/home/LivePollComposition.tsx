'use client'

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

const ACCENT = '#3ECF8E'
const BG = '#111114'
const SURFACE = '#1a1a1f'
const TEXT = '#e8e6e3'
const MUTED = '#888'
const BORDER = 'rgba(255,255,255,0.06)'

const POLL_OPTIONS = [
  { label: 'Developer experience', votes: 47, color: ACCENT },
  { label: 'Performance', votes: 31, color: 'rgba(62,207,142,0.6)' },
  { label: 'Documentation', votes: 18, color: 'rgba(62,207,142,0.4)' },
  { label: 'Pricing', votes: 12, color: 'rgba(62,207,142,0.25)' },
]

const MAX_VOTES = 47

function SpringIn({ children, delay, style }: { children: React.ReactNode; delay: number; style?: React.CSSProperties }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const progress = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } })
  const opacity = interpolate(progress, [0, 1], [0, 1])
  const y = interpolate(progress, [0, 1], [20, 0])

  return <div style={{ opacity, transform: `translateY(${y}px)`, ...style }}>{children}</div>
}

function AnimatedBar({ width, delay, color }: { width: number; delay: number; color: string }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const progress = spring({ frame: frame - delay, fps, config: { damping: 16, stiffness: 80 } })
  const w = interpolate(progress, [0, 1], [0, width])

  return (
    <div style={{
      height: 28,
      width: `${w}%`,
      borderRadius: 6,
      background: color,
      transition: 'width 0.3s',
    }} />
  )
}

function AnimatedNumber({ value, delay }: { value: number; delay: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const progress = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 80 } })
  const num = Math.round(interpolate(progress, [0, 1], [0, value]))
  return <>{num}</>
}

export function LivePollComposition() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Poll panel slides in from right at frame 30
  const pollProgress = spring({ frame: frame - 30, fps, config: { damping: 16, stiffness: 90 } })
  const pollX = interpolate(pollProgress, [0, 1], [300, 0])
  const pollOpacity = interpolate(pollProgress, [0, 1], [0, 1])

  // Live badge pulse
  const pulse = interpolate(frame % 60, [0, 30, 60], [0.4, 1, 0.4])

  return (
    <AbsoluteFill style={{
      background: BG,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Conference slide background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        padding: '40px 52px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
          DevConf 2026
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: TEXT, lineHeight: 1.15, marginBottom: 8 }}>
          Building for scale
        </div>
        <div style={{ fontSize: 14, color: MUTED, maxWidth: 380, lineHeight: 1.5, marginBottom: 24 }}>
          How we reduced deploy times by 80% and scaled to 10M requests per day.
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: '10M', sub: 'requests/day' },
            { label: '80%', sub: 'faster deploys' },
            { label: '99.99%', sub: 'uptime' },
          ].map((stat) => (
            <div key={stat.label} style={{
              flex: 1,
              background: SURFACE,
              borderRadius: 8,
              padding: '12px 14px',
              border: `1px solid ${BORDER}`,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT }}>{stat.label}</div>
              <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {['Kubernetes', 'Edge CDN', 'Zero-downtime'].map((tag) => (
            <span key={tag} style={{
              fontSize: 10,
              color: MUTED,
              background: SURFACE,
              padding: '4px 10px',
              borderRadius: 6,
              border: `1px solid ${BORDER}`,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Live poll panel overlay from right */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 260,
        transform: `translateX(${pollX}px)`,
        opacity: pollOpacity,
        background: SURFACE,
        borderLeft: `1px solid ${BORDER}`,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      }}>
        {/* Live badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>Live poll</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#ef4444',
              opacity: pulse,
            }} />
            <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 600 }}>LIVE</span>
          </div>
        </div>

        {/* Question */}
        <SpringIn delay={38}>
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, lineHeight: 1.4 }}>
            What matters most when choosing infrastructure?
          </div>
        </SpringIn>

        {/* Poll results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {POLL_OPTIONS.map((opt, i) => (
            <SpringIn key={opt.label} delay={45 + i * 6}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: TEXT }}>{opt.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT }}>
                    <AnimatedNumber value={opt.votes} delay={50 + i * 6} />%
                  </span>
                </div>
                <AnimatedBar
                  width={(opt.votes / MAX_VOTES) * 100}
                  delay={50 + i * 6}
                  color={opt.color}
                />
              </div>
            </SpringIn>
          ))}
        </div>

        {/* Vote count */}
        <SpringIn delay={75}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 0',
            borderTop: `1px solid ${BORDER}`,
          }}>
            <span style={{ fontSize: 10, color: MUTED }}>
              <AnimatedNumber value={108} delay={78} /> responses
            </span>
            <div style={{ display: 'flex' }}>
              {[0, 1, 2, 3].map((i) => {
                const dotProgress = spring({ frame: frame - (80 + i * 3), fps, config: { damping: 12 } })
                const scale = interpolate(dotProgress, [0, 1], [0, 1])
                return (
                  <div key={i} style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: `hsl(${160 + i * 40}, 50%, ${40 + i * 5}%)`,
                    border: `2px solid ${SURFACE}`,
                    transform: `scale(${scale})`,
                    marginLeft: i > 0 ? -4 : 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: 600, color: TEXT,
                  }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                )
              })}
            </div>
          </div>
        </SpringIn>
      </div>
    </AbsoluteFill>
  )
}
