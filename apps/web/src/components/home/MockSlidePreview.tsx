'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'

type ViewState = 'slide-1' | 'light-table' | 'slide-2' | 'magic-move'

const ACCENT = '#3ECF8E'
const BG = '#0f0f0f'
const SURFACE = '#1a1a1f'
const TEXT = '#e8e6e3'
const MUTED = '#888'

const SEQUENCE: { state: ViewState; duration: number }[] = [
  { state: 'slide-1', duration: 3000 },
  { state: 'light-table', duration: 2500 },
  { state: 'slide-2', duration: 2000 },
  { state: 'magic-move', duration: 2500 },
]

const STATUS_ITEMS = [
  { label: 'Engineering', pct: 75, color: '#22c55e', status: 'On track' },
  { label: 'Design', pct: 80, color: '#22c55e', status: 'On track' },
  { label: 'Marketing', pct: 40, color: '#f59e0b', status: 'At risk' },
  { label: 'Launch prep', pct: 10, color: '#6b7280', status: 'Not started' },
]

function Slide1() {
  return (
    <div style={{ padding: '32px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
        Project status
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 20 }}>
        Q2 Product Launch
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STATUS_ITEMS.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 10, color: MUTED, width: 72, flexShrink: 0 }}>{item.label}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: SURFACE, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.pct}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ height: '100%', borderRadius: 3, background: item.color }}
              />
            </div>
            <span style={{ fontSize: 9, color: item.color, width: 60, flexShrink: 0, textAlign: 'right' }}>{item.status}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, fontSize: 9, color: MUTED, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: ACCENT }} />
        Last updated: Apr 3, 2026
      </div>
    </div>
  )
}

function LightTableView() {
  const slides = [
    'Q2 Product Launch',
    'Timeline',
    'Key Metrics',
    'Team Allocation',
    'Risks and Mitigations',
    'Next Steps',
  ]

  return (
    <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, height: '100%', alignContent: 'center' }}>
      {slides.map((title, i) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          style={{
            aspectRatio: '16/9',
            background: i === 0 ? 'rgba(62, 207, 142, 0.08)' : SURFACE,
            borderRadius: 6,
            border: i === 0 ? `1px solid ${ACCENT}` : `1px solid rgba(255,255,255,0.06)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
          }}
        >
          <span style={{ fontSize: 8, color: i === 0 ? ACCENT : MUTED, textAlign: 'center' }}>{title}</span>
          <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{i + 1}</span>
        </motion.div>
      ))}
    </div>
  )
}

function MagicMoveSlides() {
  const [showSecond, setShowSecond] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowSecond(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {!showSecond ? (
          <motion.div
            key="slide-a"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', inset: 0, padding: '32px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <div style={{ fontSize: 9, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Key metrics
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 16 }}>
              Performance Dashboard
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Revenue', value: '$2.4M' },
                { label: 'Users', value: '12,847' },
                { label: 'NPS', value: '72' },
              ].map((m) => (
                <div key={m.label} style={{ flex: 1, background: SURFACE, borderRadius: 8, padding: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginTop: 4 }}>{m.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="slide-b"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: 'absolute', inset: 0, padding: '32px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <div style={{ fontSize: 9, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Key metrics
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: TEXT, marginBottom: 16 }}>
              Performance Dashboard
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Revenue', value: '$2.4M', delta: '+18%' },
                { label: 'Users', value: '12,847', delta: '+2,104' },
                { label: 'NPS', value: '72', delta: '+8' },
              ].map((m) => (
                <div key={m.label} style={{ flex: 1, background: SURFACE, borderRadius: 8, padding: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>{m.value}</span>
                    <motion.span
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      style={{ fontSize: 10, fontWeight: 600, color: ACCENT }}
                    >
                      {m.delta}
                    </motion.span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

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

  return (
    <div style={{ height: '100%', minHeight: 280, background: BG, position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {currentState === 'slide-1' && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0 }}>
            <Slide1 />
          </motion.div>
        )}
        {currentState === 'light-table' && (
          <motion.div key="lt" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0 }}>
            <LightTableView />
          </motion.div>
        )}
        {(currentState === 'slide-2' || currentState === 'magic-move') && (
          <motion.div key="mm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0 }}>
            <MagicMoveSlides />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide indicator */}
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 4,
      }}>
        {['slide', 'light table', 'magic move'].map((label, i) => (
          <div key={label} style={{
            fontSize: 7,
            color: i === (currentState === 'light-table' ? 1 : currentState === 'slide-1' ? 0 : 2) ? TEXT : 'rgba(255,255,255,0.2)',
            padding: '2px 6px',
            borderRadius: 4,
            background: i === (currentState === 'light-table' ? 1 : currentState === 'slide-1' ? 0 : 2) ? 'rgba(255,255,255,0.08)' : 'transparent',
          }}>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}
