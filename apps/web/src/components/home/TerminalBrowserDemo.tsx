'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TerminalWindow } from './TerminalWindow'
import { BrowserWindow } from './BrowserWindow'
import { TypedText } from './TypedText'

type Phase =
  | 'idle'
  | 'terminal-enter'
  | 'cmd-1' | 'cmd-2' | 'cmd-3' | 'cmd-4'
  | 'cmd-claude'
  | 'prompt-0' | 'thinking-0' | 'done-0'
  | 'prompt-1' | 'thinking-1' | 'done-1'
  | 'prompt-2' | 'thinking-2' | 'done-2'
  | 'prompt-3' | 'thinking-3' | 'done-3'

const COMMANDS = [
  'slidenerds create my-talk',
  'cd my-talk',
  'npm install',
  'npm run dev',
]

const INTERACTIONS = [
  {
    prompt: 'Create a product launch deck for Q2. Pull the latest status from https://linear.app/acme/project/q2-launch and build slides from it.',
    result: 'Created 6 slides in ./app/page.tsx',
    slideState: 'initial' as const,
  },
  {
    prompt: 'Add a Magic Move transition between the metrics slide and the team slide. Animate the revenue number.',
    result: 'Added data-magic-id to revenue element on slides 4 and 5',
    slideState: 'magic-move' as const,
  },
  {
    prompt: 'Show all slides in light table view so I can see the flow. Reorder the problem slide before the solution.',
    result: 'Reordered slides: problem now at position 2, solution at 3',
    slideState: 'light-table' as const,
  },
  {
    prompt: 'Add step animations to the metrics cards. Each card should fade in one at a time when I advance.',
    result: 'Added data-step and step-fade to 3 metric cards on slide 4',
    slideState: 'step-anim' as const,
  },
]

const TYPING_SPEED = 22
const COMMAND_GAP = 250
const THINKING_DURATION = 1800
const PAUSE_AFTER_DONE = 2500

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full bg-[#D97757]"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  )
}

function CompletedLine({ text }: { text: string }) {
  return (
    <div className="flex">
      <span className="text-[var(--primary)] mr-2 select-none">$</span>
      <span>{text}</span>
    </div>
  )
}

function ActiveLine({ text, onComplete }: { text: string; onComplete: () => void }) {
  return (
    <div className="flex">
      <span className="text-[var(--primary)] mr-2 select-none">$</span>
      <TypedText text={text} speed={TYPING_SPEED} onComplete={onComplete} />
    </div>
  )
}

function getInteractionIndex(phase: Phase): number {
  const match = phase.match(/(\d+)$/)
  return match ? parseInt(match[1], 10) : -1
}

function isAfterSplit(phase: Phase): boolean {
  const splitPhases: Phase[] = [
    'done-0', 'prompt-1', 'thinking-1', 'done-1',
    'prompt-2', 'thinking-2', 'done-2',
    'prompt-3', 'thinking-3', 'done-3',
  ]
  return splitPhases.includes(phase)
}

// -- Slide preview states --

type SlideView = 'initial' | 'magic-move' | 'light-table' | 'step-anim'

const ACCENT = '#3ECF8E'
const BG = '#0f0f0f'
const SURFACE = '#1a1a1f'
const TEXT_COLOR = '#e8e6e3'
const MUTED = '#666'
const DIM = '#444'
const BORDER_COLOR = 'rgba(255,255,255,0.06)'

function InitialSlide() {
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
        {[
          { label: 'Engineering', pct: 75, color: '#22c55e' },
          { label: 'Design', pct: 80, color: '#22c55e' },
          { label: 'Marketing', pct: 40, color: '#f59e0b' },
        ].map((item) => (
          <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 8, color: MUTED }}>{item.label}</span>
            <div style={{ height: 5, borderRadius: 3, background: SURFACE, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.pct}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ height: '100%', borderRadius: 3, background: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 7, color: DIM }}>1 / 6</div>
    </div>
  )
}

function MagicMoveSlide() {
  const [moved, setMoved] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMoved(true), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ padding: '24px 32px', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontSize: 8, fontWeight: 600, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
        {moved ? 'Team' : 'Key metrics'}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_COLOR, marginBottom: 12 }}>
        {moved ? 'Meet the team' : 'Performance dashboard'}
      </div>

      {/* The revenue badge that moves between slides */}
      <motion.div
        animate={{
          top: moved ? 16 : 90,
          right: moved ? 24 : 'auto',
          left: moved ? 'auto' : 32,
          scale: moved ? 0.7 : 1,
        }}
        transition={{ type: 'spring', damping: 14, stiffness: 100 }}
        style={{
          position: 'absolute',
          background: SURFACE,
          borderRadius: 8,
          padding: '8px 14px',
          border: `1.5px solid ${ACCENT}`,
          zIndex: 10,
        }}
      >
        <div style={{ fontSize: 6, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: ACCENT }}>$2.4M</div>
      </motion.div>

      {/* Background content that changes */}
      <AnimatePresence mode="wait">
        {!moved ? (
          <motion.div key="metrics" exit={{ opacity: 0 }} style={{ marginTop: 50, display: 'flex', gap: 8 }}>
            {[{ label: 'Users', value: '12,847' }, { label: 'NPS', value: '72' }].map((m) => (
              <div key={m.label} style={{ flex: 1, background: SURFACE, borderRadius: 6, padding: '8px 10px', border: `1px solid ${BORDER_COLOR}` }}>
                <div style={{ fontSize: 7, color: MUTED }}>{m.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_COLOR, marginTop: 2 }}>{m.value}</div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            {['Alice', 'Bob', 'Carol'].map((name, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: SURFACE, borderRadius: 6, padding: '6px 10px', border: `1px solid ${BORDER_COLOR}` }}
              >
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: `hsl(${160 + i * 40}, 50%, 45%)` }} />
                <span style={{ fontSize: 9, color: TEXT_COLOR }}>{name}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: moved ? 1 : 0 }}
        transition={{ delay: 0.8 }}
        style={{ position: 'absolute', bottom: 8, left: 32, fontSize: 7, color: ACCENT, fontWeight: 500 }}
      >
        data-magic-id=&quot;revenue&quot;
      </motion.div>
      <div style={{ position: 'absolute', bottom: 8, right: 16, fontSize: 7, color: DIM }}>
        {moved ? '5 / 6' : '4 / 6'}
      </div>
    </div>
  )
}

function MiniThumb({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

function LightTableSlide() {
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

  return (
    <div style={{ padding: 12, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 7, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8, paddingLeft: 2 }}>
        Light table
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, alignContent: 'center' }}>
        {/* Title slide */}
        <MiniThumb delay={0}>
          <div style={thumbStyle(false)}>
            <div style={{ fontSize: 5, fontWeight: 600, color: ACCENT, marginBottom: 2 }}>Q2</div>
            <div style={{ fontSize: 7, fontWeight: 700, color: TEXT_COLOR, lineHeight: 1.2 }}>Product Launch</div>
            <div style={{ fontSize: 4, color: MUTED, marginTop: 2 }}>Ship faster</div>
            <span style={{ position: 'absolute', bottom: 1, right: 3, fontSize: 4, color: 'rgba(255,255,255,0.15)' }}>1</span>
          </div>
        </MiniThumb>

        {/* Problem slide (reordered here) */}
        <MiniThumb delay={0.07}>
          <div style={thumbStyle(true)}>
            <div style={{ fontSize: 5, color: ACCENT, marginBottom: 2 }}>Problem</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[70, 40, 15].map((w, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <div style={{ width: 8, height: 2, borderRadius: 1, background: DIM }} />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ delay: 0.3 + j * 0.1, duration: 0.4 }} style={{ height: 3, borderRadius: 1, background: j === 2 ? '#f59e0b' : '#22c55e' }} />
                </div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ fontSize: 4, color: ACCENT, marginTop: 'auto' }}>moved</motion.div>
            <span style={{ position: 'absolute', bottom: 1, right: 3, fontSize: 4, color: 'rgba(255,255,255,0.15)' }}>2</span>
          </div>
        </MiniThumb>

        {/* Solution slide */}
        <MiniThumb delay={0.14}>
          <div style={thumbStyle(false)}>
            <div style={{ fontSize: 5, color: MUTED, marginBottom: 2 }}>Solution</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {[0, 1, 2].map((j) => (
                <motion.div key={j} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + j * 0.08 }} style={{ flex: 1, height: 14, borderRadius: 2, background: `rgba(62,207,142,${0.15 + j * 0.1})`, border: `1px solid ${BORDER_COLOR}` }} />
              ))}
            </div>
            <span style={{ position: 'absolute', bottom: 1, right: 3, fontSize: 4, color: 'rgba(255,255,255,0.15)' }}>3</span>
          </div>
        </MiniThumb>

        {/* Metrics slide */}
        <MiniThumb delay={0.21}>
          <div style={thumbStyle(false)}>
            <div style={{ fontSize: 5, color: MUTED, marginBottom: 2 }}>Metrics</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {[0, 1, 2].map((j) => (
                <div key={j} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 2, padding: 2, border: `1px solid ${BORDER_COLOR}` }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ delay: 0.5 + j * 0.1, duration: 0.3 }} style={{ height: 3, borderRadius: 1, background: ACCENT }} />
                </div>
              ))}
            </div>
            <span style={{ position: 'absolute', bottom: 1, right: 3, fontSize: 4, color: 'rgba(255,255,255,0.15)' }}>4</span>
          </div>
        </MiniThumb>

        {/* Team slide */}
        <MiniThumb delay={0.28}>
          <div style={thumbStyle(false)}>
            <div style={{ fontSize: 5, color: MUTED, marginBottom: 2 }}>Team</div>
            <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {[0, 1, 2, 3].map((j) => (
                <motion.div key={j} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + j * 0.06, type: 'spring', damping: 10 }} style={{ width: 8, height: 8, borderRadius: '50%', background: `hsl(${160 + j * 40}, 50%, 45%)` }} />
              ))}
            </div>
            <span style={{ position: 'absolute', bottom: 1, right: 3, fontSize: 4, color: 'rgba(255,255,255,0.15)' }}>5</span>
          </div>
        </MiniThumb>

        {/* CTA slide */}
        <MiniThumb delay={0.35}>
          <div style={thumbStyle(false)}>
            <div style={{ fontSize: 5, color: MUTED, marginBottom: 2 }}>CTA</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ width: '70%', height: 8, borderRadius: 3, background: ACCENT, marginTop: 2 }} />
            <span style={{ position: 'absolute', bottom: 1, right: 3, fontSize: 4, color: 'rgba(255,255,255,0.15)' }}>6</span>
          </div>
        </MiniThumb>
      </div>
    </div>
  )
}

function StepAnimSlide() {
  const [visibleCards, setVisibleCards] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisibleCards(1), 600),
      setTimeout(() => setVisibleCards(2), 1200),
      setTimeout(() => setVisibleCards(3), 1800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

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
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={i < visibleCards ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.35 }}
            style={{
              flex: 1,
              background: SURFACE,
              borderRadius: 6,
              padding: '10px 12px',
              border: `1px solid ${BORDER_COLOR}`,
            }}
          >
            <div style={{ fontSize: 7, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: card.color, marginTop: 3 }}>{card.value}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 4, alignItems: 'center' }}>
        {cards.map((_, i) => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: i < visibleCards ? ACCENT : DIM,
            transition: 'background 0.3s',
          }} />
        ))}
        <span style={{ fontSize: 7, color: DIM, marginLeft: 4 }}>data-step</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 7, color: DIM }}>4 / 6</div>
    </div>
  )
}

function SlidePreview({ view }: { view: SlideView }) {
  return (
    <div style={{ height: '100%', minHeight: 260, background: BG, position: 'relative', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        {view === 'initial' && (
          <motion.div key="init" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0 }}>
            <InitialSlide />
          </motion.div>
        )}
        {view === 'magic-move' && (
          <motion.div key="mm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0 }}>
            <MagicMoveSlide />
          </motion.div>
        )}
        {view === 'light-table' && (
          <motion.div key="lt" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0 }}>
            <LightTableSlide />
          </motion.div>
        )}
        {view === 'step-anim' && (
          <motion.div key="sa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ position: 'absolute', inset: 0 }}>
            <StepAnimSlide />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// -- Main component --

export function TerminalBrowserDemo() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [slideView, setSlideView] = useState<SlideView>('initial')
  const triggered = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true
          setPhase('terminal-enter')
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (phase === 'terminal-enter') {
      const t = setTimeout(() => setPhase('cmd-1'), 500)
      return () => clearTimeout(t)
    }

    if (phase.startsWith('thinking-')) {
      const idx = getInteractionIndex(phase)
      const t = setTimeout(() => {
        setSlideView(INTERACTIONS[idx].slideState)
        setPhase(`done-${idx}` as Phase)
      }, THINKING_DURATION)
      return () => clearTimeout(t)
    }

    if (phase.startsWith('done-')) {
      const idx = getInteractionIndex(phase)
      if (idx < INTERACTIONS.length - 1) {
        const t = setTimeout(() => setPhase(`prompt-${idx + 1}` as Phase), PAUSE_AFTER_DONE)
        return () => clearTimeout(t)
      }
      // After last done, restart the cycle
      const t = setTimeout(() => {
        setSlideView('initial')
        setPhase('prompt-0')
      }, PAUSE_AFTER_DONE + 1000)
      return () => clearTimeout(t)
    }
  }, [phase])

  const advanceCmd = useCallback((next: Phase) => () => {
    setTimeout(() => setPhase(next), COMMAND_GAP)
  }, [])

  const cmdSteps: Phase[] = ['cmd-1', 'cmd-2', 'cmd-3', 'cmd-4']
  const cmdIndex = cmdSteps.indexOf(phase)
  const pastCommands = cmdIndex > 0
    ? COMMANDS.slice(0, cmdIndex)
    : phase !== 'idle' && phase !== 'terminal-enter' && !cmdSteps.includes(phase)
      ? COMMANDS
      : []

  const showSplit = phase === 'done-0' || isAfterSplit(phase)
  const showTerminal = phase !== 'idle'
  const showClaudeUI = !cmdSteps.includes(phase) && phase !== 'idle' && phase !== 'terminal-enter' && phase !== 'cmd-claude'

  const currentInteractionIdx = getInteractionIndex(phase)
  const completedInteractions = currentInteractionIdx >= 0
    ? INTERACTIONS.slice(0, phase.startsWith('prompt-') ? currentInteractionIdx : currentInteractionIdx + (phase.startsWith('done-') || phase.startsWith('thinking-') ? 1 : 0))
    : phase === 'cmd-claude' ? [] : INTERACTIONS.slice(0, 0)

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto min-h-[420px]">
      <AnimatePresence>
        {showTerminal && (
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <motion.div
              className={showSplit ? 'w-full md:w-1/2' : 'w-full'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              layout
            >
              <TerminalWindow>
                <div className="space-y-1 min-h-[320px] max-h-[400px] overflow-y-auto">
                  {pastCommands.map((cmd) => (
                    <CompletedLine key={cmd} text={cmd} />
                  ))}

                  {phase === 'cmd-1' && <ActiveLine text={COMMANDS[0]} onComplete={advanceCmd('cmd-2')} />}
                  {phase === 'cmd-2' && <ActiveLine text={COMMANDS[1]} onComplete={advanceCmd('cmd-3')} />}
                  {phase === 'cmd-3' && <ActiveLine text={COMMANDS[2]} onComplete={advanceCmd('cmd-4')} />}
                  {phase === 'cmd-4' && <ActiveLine text={COMMANDS[3]} onComplete={advanceCmd('cmd-claude')} />}
                  {phase === 'cmd-claude' && (
                    <ActiveLine text="claude" onComplete={() => setTimeout(() => setPhase('prompt-0'), 400)} />
                  )}

                  {showClaudeUI && (
                    <>
                      <CompletedLine text="claude" />
                      <div className="mt-3 rounded-[var(--n-radius-md)] border border-[#3d3024] bg-[#1a1410] p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded-full bg-[#D97757] flex items-center justify-center text-[8px] font-bold text-white">
                            C
                          </div>
                          <span className="text-[#D97757] font-bold text-xs">Claude Code</span>
                        </div>

                        {/* Completed interactions */}
                        {completedInteractions.map((interaction, i) => {
                          const isCurrentThinking = phase === `thinking-${i}`
                          const isCurrentDone = phase === `done-${i}` || getInteractionIndex(phase) > i
                          if (!isCurrentDone && !isCurrentThinking) return null
                          return (
                            <div key={i} className="mb-3">
                              <div className="text-xs leading-relaxed text-[#a08b7a] mb-1">{interaction.prompt}</div>
                              <div className="text-xs text-[#D97757] font-medium">{interaction.result}</div>
                            </div>
                          )
                        })}

                        {/* Current prompt being typed */}
                        {phase.startsWith('prompt-') && (
                          <div className="text-xs leading-relaxed">
                            <TypedText
                              text={INTERACTIONS[currentInteractionIdx].prompt}
                              speed={TYPING_SPEED}
                              onComplete={() => setTimeout(() => setPhase(`thinking-${currentInteractionIdx}` as Phase), 400)}
                            />
                          </div>
                        )}

                        {/* Thinking state */}
                        {phase.startsWith('thinking-') && (
                          <>
                            <div className="text-xs leading-relaxed text-[#a08b7a]">
                              {INTERACTIONS[currentInteractionIdx].prompt}
                            </div>
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#a08b7a]">
                              <span>Thinking</span>
                              <ThinkingDots />
                            </div>
                          </>
                        )}

                        {/* Just completed current interaction */}
                        {phase.startsWith('done-') && currentInteractionIdx === getInteractionIndex(phase) && (
                          <div>
                            <div className="text-xs leading-relaxed text-[#a08b7a] mb-1">
                              {INTERACTIONS[currentInteractionIdx].prompt}
                            </div>
                            <div className="text-xs text-[#D97757] font-medium">
                              {INTERACTIONS[currentInteractionIdx].result}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </TerminalWindow>
            </motion.div>

            <AnimatePresence>
              {showSplit && (
                <motion.div
                  className="w-full md:w-1/2"
                  initial={{ opacity: 0, x: 40, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <BrowserWindow url="localhost:3000">
                    <SlidePreview view={slideView} />
                  </BrowserWindow>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
