'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

type ViewState = 'slide-1' | 'light-table' | 'slide-2' | 'magic-move'

const ACCENT = '#3ECF8E'
const BG = '#0f0f0f'
const SURFACE = '#1a1a1f'
const TEXT = '#e8e6e3'
const MUTED = '#666'
const DIM = '#444'
const BORDER = 'rgba(255,255,255,0.06)'

const SEQUENCE: { state: ViewState; duration: number }[] = [
  { state: 'slide-1', duration: 3500 },
  { state: 'light-table', duration: 3000 },
  { state: 'slide-2', duration: 2000 },
  { state: 'magic-move', duration: 3000 },
]

// -- Reusable mini content for thumbnails --

function MiniStatusBars({ animate = false }: { animate?: boolean }) {
  const bars = [
    { w: 75, color: '#22c55e' },
    { w: 80, color: '#22c55e' },
    { w: 40, color: '#f59e0b' },
    { w: 10, color: '#6b7280' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {bars.map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 20, height: 2, borderRadius: 1, background: DIM }} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            {animate ? (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${b.w}%` }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
                style={{ height: '100%', borderRadius: 2, background: b.color }}
              />
            ) : (
              <div style={{ width: `${b.w}%`, height: '100%', borderRadius: 2, background: b.color }} />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function MiniTimeline() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: i < 2 ? ACCENT : DIM }} />
          <div style={{ flex: 1, height: 2, borderRadius: 1, background: i < 2 ? 'rgba(62,207,142,0.3)' : 'rgba(255,255,255,0.04)' }} />
        </div>
      ))}
    </div>
  )
}

function MiniMetricCards() {
  return (
    <div style={{ display: 'flex', gap: 3, width: '100%' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 3, padding: '4px 3px', border: `1px solid ${BORDER}` }}>
          <div style={{ width: '60%', height: 2, borderRadius: 1, background: DIM, marginBottom: 3 }} />
          <div style={{ width: '40%', height: 4, borderRadius: 1, background: ACCENT }} />
        </div>
      ))}
    </div>
  )
}

function MiniTeamGrid() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{
          width: 12, height: 12, borderRadius: '50%',
          background: `hsl(${160 + i * 35}, 45%, ${35 + i * 4}%)`,
        }} />
      ))}
    </div>
  )
}

function MiniRisks() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {['#ef4444', '#f59e0b', '#f59e0b'].map((color, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: 2, background: color }} />
          <div style={{ flex: 1, height: 2, borderRadius: 1, background: DIM }} />
        </div>
      ))}
    </div>
  )
}

function MiniNextSteps() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 6, height: 6, borderRadius: 2, border: `1.5px solid ${i === 0 ? ACCENT : DIM}`,
            background: i === 0 ? ACCENT : 'transparent',
          }} />
          <div style={{ flex: 1, height: 2, borderRadius: 1, background: DIM }} />
        </div>
      ))}
    </div>
  )
}

// -- Slide thumbnails data --

const THUMB_DATA = [
  { label: 'Q2 Product Launch', content: MiniStatusBars },
  { label: 'Timeline', content: MiniTimeline },
  { label: 'Key Metrics', content: MiniMetricCards },
  { label: 'Team', content: MiniTeamGrid },
  { label: 'Risks', content: MiniRisks },
  { label: 'Next Steps', content: MiniNextSteps },
]

// -- Full slide views --

const STATUS_ITEMS = [
  { label: 'Engineering', pct: 75, color: '#22c55e', status: 'On track' },
  { label: 'Design', pct: 80, color: '#22c55e', status: 'On track' },
  { label: 'Marketing', pct: 40, color: '#f59e0b', status: 'At risk' },
  { label: 'Launch prep', pct: 10, color: '#6b7280', status: 'Not started' },
]

function Slide1() {
  return (
    <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
        Project status
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 4 }}>
        Q2 Product Launch
      </div>
      <div style={{ fontSize: 10, color: MUTED, marginBottom: 16 }}>
        Engineering, design, marketing, and launch readiness
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {STATUS_ITEMS.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 9, color: MUTED, width: 64, flexShrink: 0 }}>{item.label}</span>
            <div style={{ flex: 1, height: 5, borderRadius: 3, background: SURFACE, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.pct}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{ height: '100%', borderRadius: 3, background: item.color }}
              />
            </div>
            <span style={{ fontSize: 8, color: item.color, width: 56, flexShrink: 0, textAlign: 'right', fontWeight: 500 }}>{item.status}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 8, color: DIM, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: ACCENT }} />
          Updated Apr 3, 2026
        </div>
        <div style={{ fontSize: 8, color: DIM }}>1 / 6</div>
      </div>
    </div>
  )
}

function LightTableView() {
  return (
    <div style={{ padding: '14px 16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 8, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, paddingLeft: 2 }}>
        Light table
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, alignContent: 'center' }}>
        {THUMB_DATA.map(({ label, content: Content }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: 'easeOut' }}
            style={{
              aspectRatio: '16/9',
              background: i === 0 ? 'rgba(62, 207, 142, 0.06)' : SURFACE,
              borderRadius: 6,
              border: i === 0 ? `1.5px solid ${ACCENT}` : `1px solid ${BORDER}`,
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div style={{ fontSize: 6, fontWeight: 600, color: i === 0 ? ACCENT : MUTED, marginBottom: 5, lineHeight: 1 }}>
              {label}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Content />
            </div>
            <div style={{
              position: 'absolute', bottom: 3, right: 5,
              fontSize: 6, color: 'rgba(255,255,255,0.15)',
            }}>
              {i + 1}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const METRICS = [
  { label: 'Revenue', value: '$2.4M' },
  { label: 'Users', value: '12,847' },
  { label: 'NPS', value: '72' },
]

const METRICS_WITH_DELTA = [
  { label: 'Revenue', value: '$2.4M', delta: '+18%', deltaColor: ACCENT },
  { label: 'Users', value: '12,847', delta: '+2,104', deltaColor: ACCENT },
  { label: 'NPS', value: '72', delta: '+8', deltaColor: ACCENT },
]

function MetricCard({ label, value, delta, deltaColor, animate }: {
  label: string; value: string; delta?: string; deltaColor?: string; animate?: boolean
}) {
  return (
    <div style={{ flex: 1, background: SURFACE, borderRadius: 8, padding: '10px 12px', border: `1px solid ${BORDER}` }}>
      <div style={{ fontSize: 7, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 3 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{value}</span>
        {delta && animate && (
          <motion.span
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', damping: 12 }}
            style={{ fontSize: 9, fontWeight: 600, color: deltaColor }}
          >
            {delta}
          </motion.span>
        )}
      </div>
    </div>
  )
}

function MagicMoveSlides() {
  const [showSecond, setShowSecond] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowSecond(true), 1000)
    return () => clearTimeout(t)
  }, [])

  const slideContent = (
    <>
      <div style={{ fontSize: 9, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
        Key metrics
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 14 }}>
        Performance Dashboard
      </div>
    </>
  )

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {!showSecond ? (
          <motion.div
            key="slide-a"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.97 }}
            transition={{ duration: 0.45 }}
            style={{ position: 'absolute', inset: 0, padding: '28px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            {slideContent}
            <div style={{ display: 'flex', gap: 8 }}>
              {METRICS.map((m) => (
                <MetricCard key={m.label} label={m.label} value={m.value} />
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
              {[65, 85, 45, 90, 70, 55, 80].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: h * 0.5 }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.4 }}
                  style={{
                    width: 16,
                    borderRadius: '2px 2px 0 0',
                    background: i === 6 ? ACCENT : 'rgba(62,207,142,0.2)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="slide-b"
            initial={{ opacity: 0, x: 60, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            style={{ position: 'absolute', inset: 0, padding: '28px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            {slideContent}
            <div style={{ display: 'flex', gap: 8 }}>
              {METRICS_WITH_DELTA.map((m) => (
                <MetricCard key={m.label} label={m.label} value={m.value} delta={m.delta} deltaColor={m.deltaColor} animate />
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
              {[65, 85, 45, 90, 70, 55, 80, 95, 60].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: h * 0.5 }}
                  transition={{ delay: 0.15 + i * 0.04, duration: 0.4 }}
                  style={{
                    width: 16,
                    borderRadius: '2px 2px 0 0',
                    background: i >= 7 ? ACCENT : 'rgba(62,207,142,0.2)',
                  }}
                />
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ position: 'absolute', bottom: 10, right: 16, fontSize: 7, color: DIM }}
            >
              magic move
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// -- Main component --

export function MockSlidePreview() {
  const [stateIndex, setStateIndex] = useState(0)

  useEffect(() => {
    const current = SEQUENCE[stateIndex]
    const t = setTimeout(() => {
      setStateIndex((i) => (i + 1) % SEQUENCE.length)
    }, current.duration)
    return () => clearTimeout(t)
  }, [stateIndex])

  const currentState = SEQUENCE[stateIndex].state

  const indicatorIndex = currentState === 'slide-1' ? 0 : currentState === 'light-table' ? 1 : 2
  const labels = ['slide', 'light table', 'magic move']

  return (
    <div style={{ height: '100%', minHeight: 280, background: BG, position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {currentState === 'slide-1' && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.35 }} style={{ position: 'absolute', inset: 0 }}>
            <Slide1 />
          </motion.div>
        )}
        {currentState === 'light-table' && (
          <motion.div key="lt" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} transition={{ duration: 0.4, ease: 'easeOut' }} style={{ position: 'absolute', inset: 0 }}>
            <LightTableView />
          </motion.div>
        )}
        {(currentState === 'slide-2' || currentState === 'magic-move') && (
          <motion.div key="mm" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ position: 'absolute', inset: 0 }}>
            <MagicMoveSlides />
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{
        position: 'absolute',
        bottom: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 3,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        borderRadius: 6,
        padding: '3px 4px',
      }}>
        {labels.map((label, i) => (
          <div key={label} style={{
            fontSize: 7,
            fontWeight: i === indicatorIndex ? 600 : 400,
            color: i === indicatorIndex ? TEXT : 'rgba(255,255,255,0.25)',
            padding: '2px 8px',
            borderRadius: 4,
            background: i === indicatorIndex ? 'rgba(255,255,255,0.1)' : 'transparent',
            transition: 'all 200ms ease',
          }}>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
