'use client'

import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

import {
  ACCENT, BG, SURFACE, TEXT_COLOR, MUTED, DIM, BORDER_COLOR,
  INTERACTION_FRAMES, SPLIT_START, IDE_SLIDE_APPEAR,
  type SlideView,
} from './constants'

// Shared spring helper
const useSpringProgress = (delay: number) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 120 } })
}

// -- InitialSlide --

function InitialSlide({ sceneStart }: { sceneStart: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const bars = [
    { label: 'Engineering', pct: 75, color: '#22c55e' },
    { label: 'Design', pct: 80, color: '#22c55e' },
    { label: 'Marketing', pct: 40, color: '#f59e0b' },
  ]

  return (
    <div style={{ padding: '24px 32px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: 8, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
        Q2 Product Launch
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_COLOR, marginBottom: 4 }}>
        Ship faster, measure everything
      </div>
      <div style={{ fontSize: 10, color: MUTED, marginBottom: 16 }}>
        Engineering, design, and go-to-market readiness
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {bars.map((item, i) => {
          const progress = spring({
            frame: frame - (sceneStart + 6 + i * 4),
            fps,
            config: { damping: 16, stiffness: 100 },
          })
          const width = interpolate(progress, [0, 1], [0, item.pct])
          return (
            <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 8, color: MUTED }}>{item.label}</span>
              <div style={{ height: 5, borderRadius: 3, background: SURFACE, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: item.color, width: `${width}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: 7, color: DIM }}>1 / 6</div>
    </div>
  )
}

// -- MagicMoveSlide --

function MagicMoveSlide({ sceneStart }: { sceneStart: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const moveFrame = sceneStart + 24
  const moved = frame >= moveFrame
  const moveProgress = spring({
    frame: frame - moveFrame,
    fps,
    config: { damping: 14, stiffness: 100 },
  })

  const badgeTop = interpolate(moveProgress, [0, 1], [90, 16])
  const badgeRight = interpolate(moveProgress, [0, 1], [0, 24])
  const badgeScale = interpolate(moveProgress, [0, 1], [1, 0.7])
  const contentOpacity = interpolate(moveProgress, [0, 1], [1, 0])
  const teamOpacity = interpolate(moveProgress, [0, 1], [0, 1])

  return (
    <div style={{ padding: '24px 32px', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontSize: 8, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
        {moved ? 'Team' : 'Key metrics'}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_COLOR, marginBottom: 12 }}>
        {moved ? 'Meet the team' : 'Performance dashboard'}
      </div>

      {/* Revenue badge */}
      <div style={{
        position: 'absolute',
        top: badgeTop,
        right: badgeRight,
        transform: `scale(${badgeScale})`,
        background: SURFACE,
        borderRadius: 8,
        padding: '8px 14px',
        border: `1.5px solid ${ACCENT}`,
        zIndex: 10,
      }}>
        <div style={{ fontSize: 6, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: ACCENT }}>$2.4M</div>
      </div>

      {/* Metrics (fades out) */}
      <div style={{ marginTop: 50, display: 'flex', gap: 8, opacity: contentOpacity }}>
        {[{ label: 'Users', value: '12,847' }, { label: 'NPS', value: '72' }].map((m) => (
          <div key={m.label} style={{ flex: 1, background: SURFACE, borderRadius: 6, padding: '8px 10px', border: `1px solid ${BORDER_COLOR}` }}>
            <div style={{ fontSize: 7, color: MUTED }}>{m.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_COLOR, marginTop: 2 }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Team (fades in) */}
      <div style={{ position: 'absolute', left: 32, top: 70, display: 'flex', gap: 6, opacity: teamOpacity }}>
        {['Alice', 'Bob', 'Carol'].map((name, i) => {
          const p = spring({ frame: frame - (moveFrame + 10 + i * 3), fps, config: { damping: 12 } })
          return (
            <div
              key={name}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: SURFACE, borderRadius: 6, padding: '6px 10px',
                border: `1px solid ${BORDER_COLOR}`,
                opacity: interpolate(p, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(p, [0, 1], [10, 0])}px)`,
              }}
            >
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: `hsl(${160 + i * 40}, 50%, 45%)` }} />
              <span style={{ fontSize: 9, color: TEXT_COLOR }}>{name}</span>
            </div>
          )
        })}
      </div>

      <div style={{
        position: 'absolute', bottom: 8, left: 32, fontSize: 7, color: ACCENT, fontWeight: 500,
        opacity: interpolate(moveProgress, [0, 1], [0, 1]),
      }}>
        data-magic-id=&quot;revenue&quot;
      </div>
      <div style={{ position: 'absolute', bottom: 8, right: 16, fontSize: 7, color: DIM }}>
        {moved ? '5 / 6' : '4 / 6'}
      </div>
    </div>
  )
}

// -- LightTableSlide --

function LightTableSlide({ sceneStart }: { sceneStart: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const thumbStyle = (active: boolean): React.CSSProperties => ({
    aspectRatio: '16/9',
    background: active ? 'rgba(62,207,142,0.08)' : SURFACE,
    borderRadius: 4,
    border: active ? `1.5px solid ${ACCENT}` : `1px solid ${BORDER_COLOR}`,
    padding: '5px 6px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  })

  const thumbs = [
    { label: 'Q2', sub: 'Product Launch', active: false },
    { label: 'Problem', sub: null, active: true },
    { label: 'Solution', sub: null, active: false },
    { label: 'Metrics', sub: null, active: false },
    { label: 'Team', sub: null, active: false },
    { label: 'CTA', sub: null, active: false },
  ]

  return (
    <div style={{ padding: 12, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 7, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>
        Light table
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, alignContent: 'center' }}>
        {thumbs.map((thumb, i) => {
          const p = spring({ frame: frame - (sceneStart + i * 3), fps, config: { damping: 14, stiffness: 120 } })
          const opacity = interpolate(p, [0, 1], [0, 1])
          const y = interpolate(p, [0, 1], [8, 0])
          const scale = interpolate(p, [0, 1], [0.92, 1])
          return (
            <div key={thumb.label} style={{ opacity, transform: `translateY(${y}px) scale(${scale})` }}>
              <div style={thumbStyle(thumb.active)}>
                <div style={{ fontSize: 5, fontWeight: 600, color: thumb.active ? ACCENT : MUTED, marginBottom: 2 }}>
                  {thumb.label}
                </div>
                {thumb.sub && (
                  <div style={{ fontSize: 7, fontWeight: 700, color: TEXT_COLOR, lineHeight: 1.2 }}>{thumb.sub}</div>
                )}
                {thumb.active && (
                  <div style={{ fontSize: 4, color: ACCENT, marginTop: 'auto' }}>moved</div>
                )}
                <span style={{ position: 'absolute', bottom: 1, right: 3, fontSize: 4, color: 'rgba(255,255,255,0.15)' }}>
                  {i + 1}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// -- StepAnimSlide --

function StepAnimSlide({ sceneStart }: { sceneStart: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const cards = [
    { label: 'Revenue', value: '$2.4M', color: ACCENT },
    { label: 'Users', value: '12,847', color: '#3b82f6' },
    { label: 'NPS', value: '72', color: '#a855f7' },
  ]

  return (
    <div style={{ padding: '24px 32px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ fontSize: 8, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
        Key metrics
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_COLOR, marginBottom: 12 }}>
        Performance dashboard
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {cards.map((card, i) => {
          const cardStart = sceneStart + 18 + i * 18
          const p = spring({ frame: frame - cardStart, fps, config: { damping: 14, stiffness: 120 } })
          const opacity = interpolate(p, [0, 1], [0, 1])
          const y = interpolate(p, [0, 1], [16, 0])
          return (
            <div
              key={card.label}
              style={{
                flex: 1, background: SURFACE, borderRadius: 6, padding: '10px 12px',
                border: `1px solid ${BORDER_COLOR}`,
                opacity, transform: `translateY(${y}px)`,
              }}
            >
              <div style={{ fontSize: 7, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: card.color, marginTop: 3 }}>{card.value}</div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 4, alignItems: 'center' }}>
        {cards.map((_, i) => {
          const visible = frame >= sceneStart + 18 + i * 18
          return (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%',
              background: visible ? ACCENT : DIM,
              transition: 'none',
            }} />
          )
        })}
        <span style={{ fontSize: 7, color: DIM, marginLeft: 4 }}>data-step</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 7, color: DIM }}>4 / 6</div>
    </div>
  )
}

// -- CTASlide --

function CTASlide({ sceneStart }: { sceneStart: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const titleProgress = spring({ frame: frame - sceneStart, fps, config: { damping: 14, stiffness: 120 } })
  const subtitleProgress = spring({ frame: frame - (sceneStart + 8), fps, config: { damping: 14, stiffness: 120 } })
  const buttonsProgress = spring({ frame: frame - (sceneStart + 16), fps, config: { damping: 14, stiffness: 120 } })

  return (
    <div style={{ padding: '24px 32px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{
        fontSize: 22, fontWeight: 700, color: TEXT_COLOR, marginBottom: 8,
        opacity: interpolate(titleProgress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(titleProgress, [0, 1], [20, 0])}px)`,
      }}>
        Ready to ship?
      </div>
      <div style={{
        fontSize: 11, color: MUTED, marginBottom: 16,
        opacity: interpolate(subtitleProgress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(subtitleProgress, [0, 1], [12, 0])}px)`,
      }}>
        Start building with SlideNerds today.
      </div>
      <div style={{
        display: 'flex', gap: 8,
        opacity: interpolate(buttonsProgress, [0, 1], [0, 1]),
        transform: `translateY(${interpolate(buttonsProgress, [0, 1], [12, 0])}px)`,
      }}>
        <div style={{
          background: ACCENT, color: BG, padding: '6px 14px', borderRadius: 6,
          fontSize: 10, fontWeight: 600,
        }}>
          Get started
        </div>
        <div style={{
          background: 'transparent', color: TEXT_COLOR, padding: '6px 14px', borderRadius: 6,
          fontSize: 10, fontWeight: 500, border: `1px solid ${BORDER_COLOR}`,
        }}>
          View docs
        </div>
      </div>
      <div style={{ marginTop: 16, fontSize: 7, color: DIM }}>7 / 7</div>
    </div>
  )
}

// -- Scene switcher --

type SlidePreviewScenesProps = {
  view: SlideView
}

export function SlidePreviewScenes({ view }: SlidePreviewScenesProps) {
  const frame = useCurrentFrame()

  const sceneStartMap: Record<SlideView, number> = {
    'initial': SPLIT_START,
    'magic-move': INTERACTION_FRAMES[1].doneStart,
    'light-table': INTERACTION_FRAMES[2].doneStart,
    'step-anim': INTERACTION_FRAMES[3].doneStart,
    'cta': IDE_SLIDE_APPEAR,
  }
  const sceneStart = sceneStartMap[view]

  const fadeIn = interpolate(frame, [sceneStart, sceneStart + 9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  return (
    <div style={{ height: '100%', background: BG, position: 'relative', overflow: 'hidden', opacity: fadeIn }}>
      {view === 'initial' && <InitialSlide sceneStart={sceneStart} />}
      {view === 'magic-move' && <MagicMoveSlide sceneStart={sceneStart} />}
      {view === 'light-table' && <LightTableSlide sceneStart={sceneStart} />}
      {view === 'step-anim' && <StepAnimSlide sceneStart={sceneStart} />}
      {view === 'cta' && <CTASlide sceneStart={sceneStart} />}
    </div>
  )
}
