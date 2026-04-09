'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toCssLength, useSlideActiveReplay } from '../slide-replay.js'
import type { ClaudeCodeLine, ClaudeCodeLineKind, ClaudeCodeProps } from './types.js'

const DEFAULT_HEIGHT = 440
const DEFAULT_LPS = 10
const DEFAULT_START_DELAY = 400

const BANNER = [
  ' ██████╗██╗      █████╗ ██╗   ██╗██████╗ ███████╗',
  '██╔════╝██║     ██╔══██╗██║   ██║██╔══██╗██╔════╝',
  '██║     ██║     ███████║██║   ██║██║  ██║█████╗  ',
  '██║     ██║     ██╔══██║██║   ██║██║  ██║██╔══╝  ',
  '╚██████╗███████╗██║  ██║╚██████╔╝██████╔╝███████╗',
  ' ╚═════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝',
]

type StyleMap = Record<ClaudeCodeLineKind, React.CSSProperties>

const LINE_STYLES: StyleMap = {
  banner: { color: '#D97706', fontWeight: 700 },
  welcome: { color: '#D97706', fontWeight: 600 },
  tip: { color: 'rgba(255,255,255,0.4)' },
  prompt: { color: 'rgba(255,255,255,0.92)', fontWeight: 600 },
  claude: { color: 'rgba(255,255,255,0.85)' },
  working: { color: '#D97706', fontWeight: 500 },
  tool: { color: 'rgba(255,255,255,0.55)' },
  toolResult: { color: 'rgba(255,255,255,0.4)', paddingLeft: '1.5rem' },
  file: { color: '#22c55e' },
  success: { color: '#22c55e', fontWeight: 600 },
  blank: {},
}

const PREFIX: Partial<Record<ClaudeCodeLineKind, string>> = {
  prompt: '> ',
  claude: '✻ ',
  working: '● ',
  tool: '⎿ ',
}

const buildHeaderLines = (
  banner: boolean,
  welcome: boolean,
  cwd: string | undefined,
): ClaudeCodeLine[] => {
  const lines: ClaudeCodeLine[] = []
  if (banner) {
    for (const row of BANNER) lines.push({ kind: 'banner', text: row })
    lines.push({ kind: 'blank' })
  }
  if (welcome) {
    lines.push({ kind: 'welcome', text: '✻ Welcome to Claude Code!' })
    lines.push({ kind: 'blank' })
  }
  if (cwd) {
    lines.push({ kind: 'tip', text: `  cwd: ${cwd}` })
    lines.push({ kind: 'tip', text: '  /help for help, /status for your current setup' })
    lines.push({ kind: 'blank' })
  }
  return lines
}

const TrafficLight: React.FC<{ color: string }> = ({ color }) => (
  <span
    style={{
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      background: color,
      display: 'inline-block',
    }}
  />
)

const renderLine = (line: ClaudeCodeLine, key: React.Key): React.ReactNode => {
  if (line.kind === 'blank') {
    return <div key={key} style={{ height: '0.7em' }} aria-hidden="true" />
  }
  const style = LINE_STYLES[line.kind]
  const prefix = line.gutter ?? PREFIX[line.kind] ?? ''
  return (
    <div
      key={key}
      style={{
        whiteSpace: 'pre-wrap',
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        fontSize: '0.82rem',
        lineHeight: 1.55,
        ...style,
      }}
    >
      {prefix}
      {line.text}
    </div>
  )
}

export const ClaudeCode: React.FC<ClaudeCodeProps> = ({
  cwd,
  model = 'claude-sonnet-4-6',
  banner = false,
  welcome = false,
  session,
  height = DEFAULT_HEIGHT,
  autoScroll = true,
  typewriter = false,
  linesPerSecond = DEFAULT_LPS,
  showCursor = false,
  startDelay = DEFAULT_START_DELAY,
  className,
  style,
}) => {
  const allLines = useMemo(
    () => [...buildHeaderLines(banner, welcome, cwd), ...session],
    [banner, welcome, cwd, session],
  )

  const [visibleCount, setVisibleCount] = useState(typewriter ? 0 : allLines.length)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startPlayback = useCallback(() => {
    if (!typewriter) {
      setVisibleCount(allLines.length)
      return
    }
    clearTimer()
    setVisibleCount(0)
    const intervalMs = Math.max(10, Math.floor(1000 / Math.max(1, linesPerSecond)))
    const tick = (index: number) => {
      setVisibleCount(index)
      if (index < allLines.length) {
        timerRef.current = setTimeout(() => tick(index + 1), intervalMs)
      }
    }
    if (allLines.length === 0) return
    timerRef.current = setTimeout(() => tick(1), startDelay)
  }, [allLines, typewriter, linesPerSecond, startDelay, clearTimer])

  const showAll = useCallback(() => {
    clearTimer()
    setVisibleCount(allLines.length)
  }, [allLines.length, clearTimer])

  useSlideActiveReplay({
    ref: containerRef,
    onActive: startPlayback,
    onStandalone: showAll,
    onCleanup: clearTimer,
    deps: [startPlayback, showAll, clearTimer],
  })

  useEffect(() => {
    if (!autoScroll) return
    const el = scrollRef.current
    if (!el) return
    if (typeof el.scrollTo === 'function') {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    } else {
      el.scrollTop = el.scrollHeight
    }
  }, [visibleCount, autoScroll])

  const visibleLines = allLines.slice(0, visibleCount)

  return (
    <div
      ref={containerRef}
      className={className}
      data-testid="claude-code"
      style={{
        width: '100%',
        maxWidth: '860px',
        background: '#0d0d0f',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 28px 60px -24px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        color: 'rgba(255, 255, 255, 0.9)',
        ...style,
      }}
    >
      <style>{`
        @keyframes claude-code-cursor {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0.7rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: '#151519',
          gap: '0.8rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.45rem' }}>
          <TrafficLight color="#ff5f57" />
          <TrafficLight color="#febc2e" />
          <TrafficLight color="#28c840" />
        </div>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            fontSize: '0.78rem',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          claude · {model}
          {cwd ? ` · ${cwd}` : ''}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div
          ref={scrollRef}
          style={{
            height: toCssLength(height),
            overflowY: 'auto',
            padding: '1.25rem 1.4rem',
            scrollBehavior: 'smooth',
          }}
        >
          {visibleLines.map((line, i) => renderLine(line, i))}
        </div>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '0 0 auto 0',
            height: '28px',
            background: 'linear-gradient(180deg, #0d0d0f, rgba(13, 13, 15, 0))',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 'auto 0 0 0',
            height: '28px',
            background: 'linear-gradient(0deg, #0d0d0f, rgba(13, 13, 15, 0))',
            pointerEvents: 'none',
          }}
        />
      </div>

      {showCursor && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.85rem 1.1rem',
            borderTop: '1px solid rgba(217, 119, 6, 0.3)',
            background: '#111114',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            fontSize: '0.85rem',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <span style={{ color: '#D97706', fontWeight: 600 }}>&gt;</span>
          <span
            style={{
              display: 'inline-block',
              width: '0.55em',
              height: '1.1em',
              background: '#D97706',
              animation: 'claude-code-cursor 1.05s steps(1) infinite',
            }}
          />
        </div>
      )}
    </div>
  )
}
