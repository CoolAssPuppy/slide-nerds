'use client'

import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

import { TerminalContent } from './TerminalContent'
import { SlidePreviewScenes } from './SlidePreviewScenes'
import { EditorContent } from './EditorContent'
import {
  BG, BORDER_COLOR, ACCENT,
  TERMINAL_ENTER, SPLIT_START, INTERACTION_FRAMES,
  IDE_START, IDE_SLIDE_APPEAR,
  FADE_FRAMES, TOTAL_DURATION,
  type SlideView,
} from './constants'

const getSlideView = (frame: number): SlideView => {
  if (frame >= IDE_SLIDE_APPEAR) return 'cta'
  if (frame >= INTERACTION_FRAMES[3].doneStart) return 'step-anim'
  if (frame >= INTERACTION_FRAMES[2].doneStart) return 'light-table'
  if (frame >= INTERACTION_FRAMES[1].doneStart) return 'magic-move'
  return 'initial'
}

// Dot grid background with parallax
function DesktopBackground({ frame }: { frame: number }) {
  const yOffset = frame * 0.15
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
      backgroundPosition: `0 ${yOffset}px`,
    }} />
  )
}

// macOS-style window chrome
function WindowChrome({ title, accentDot }: { title: string; accentDot?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 12px',
      background: '#1a1a1a',
      borderBottom: `1px solid ${BORDER_COLOR}`,
    }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: accentDot ? ACCENT : '#28c840' }} />
      <span style={{ marginLeft: 6, fontSize: 10, color: '#666' }}>{title}</span>
    </div>
  )
}

// Browser address bar chrome
function BrowserChrome({ url }: { url: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 12px',
      background: '#1a1a1a',
      borderBottom: `1px solid ${BORDER_COLOR}`,
    }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
      <div style={{
        marginLeft: 8, flex: 1, background: '#0f0f0f', borderRadius: 4,
        padding: '3px 10px', fontSize: 9, color: '#666',
      }}>
        {url}
      </div>
    </div>
  )
}

export function TerminalDemoComposition() {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Global fade in/out for loop transition
  const fadeIn = interpolate(frame, [0, FADE_FRAMES], [0, 1], { extrapolateRight: 'clamp' })
  const fadeOut = interpolate(frame, [TOTAL_DURATION - FADE_FRAMES, TOTAL_DURATION], [1, 0], { extrapolateLeft: 'clamp' })
  const globalOpacity = Math.min(fadeIn, fadeOut)

  // Terminal entrance
  const enterProgress = spring({ frame: frame - TERMINAL_ENTER, fps, config: { damping: 16, stiffness: 90 } })
  const terminalOpacity = interpolate(enterProgress, [0, 1], [0, 1])
  const terminalInitialY = interpolate(enterProgress, [0, 1], [30, 0])

  // Split transition: terminal slides left, browser slides in from right
  const splitProgress = spring({ frame: frame - SPLIT_START, fps, config: { damping: 16, stiffness: 80 } })
  const showBrowser = frame >= SPLIT_START

  // IDE phase: editor appears over terminal, terminal shrinks and tucks behind
  const showEditor = frame >= IDE_START
  const ideProgress = spring({ frame: frame - IDE_START, fps, config: { damping: 16, stiffness: 80 } })

  // Terminal position across all three phases
  // Phase 1 (pre-split): centered, full-width
  // Phase 2 (split): left half
  // Phase 3 (IDE): shrinks down, shifts down-left, sits behind editor
  const preSplitWidth = interpolate(splitProgress, [0, 1], [88, 48])
  const preSplitLeft = interpolate(splitProgress, [0, 1], [6, 2])
  const terminalWidth = showEditor
    ? interpolate(ideProgress, [0, 1], [48, 44])
    : preSplitWidth
  const terminalLeft = showEditor
    ? interpolate(ideProgress, [0, 1], [2, 1])
    : preSplitLeft
  const terminalTop = showEditor
    ? interpolate(ideProgress, [0, 1], [6, 42])
    : 6
  const terminalHeight = showEditor
    ? interpolate(ideProgress, [0, 1], [88, 54])
    : 88
  const terminalScale = showEditor
    ? interpolate(ideProgress, [0, 1], [1, 0.95])
    : 1

  // Browser position
  const browserOpacity = interpolate(splitProgress, [0, 1], [0, 1])
  const browserX = interpolate(splitProgress, [0, 1], [60, 0])
  const browserScale = interpolate(splitProgress, [0, 1], [0.95, 1])

  // Editor position: slides in from above, overlaps terminal
  const editorOpacity = interpolate(ideProgress, [0, 1], [0, 1])
  const editorY = interpolate(ideProgress, [0, 1], [-40, 0])
  const editorRotateX = interpolate(ideProgress, [0, 1], [4, 0])

  // Parallax floating bob
  const terminalBob = Math.sin(frame * 0.025) * 3
  const browserBob = Math.sin(frame * 0.03 + 1) * 2.5
  const editorBob = Math.sin(frame * 0.022 + 0.5) * 2

  // 3D entrance rotation
  const terminalRotateY = interpolate(enterProgress, [0, 1], [-2, 0])
  const browserRotateY = interpolate(splitProgress, [0, 1], [3, 0])

  // Micro-settle on interaction completions
  const settleOffsets = INTERACTION_FRAMES.map((f) => {
    const p = spring({ frame: frame - f.doneStart, fps, config: { damping: 8, stiffness: 200 } })
    return interpolate(p, [0, 0.5, 1], [0, 2, 0])
  })
  const terminalSettle = settleOffsets.reduce((sum, v) => sum + v, 0)

  // Dynamic shadows
  const terminalShadow = `0 ${12 + terminalBob}px ${32 + terminalBob * 2}px rgba(0,0,0,0.4)`
  const browserShadow = `0 ${10 + browserBob}px ${28 + browserBob * 2}px rgba(0,0,0,0.35)`
  const editorShadow = `0 ${14 + editorBob}px ${36 + editorBob * 2}px rgba(0,0,0,0.5)`

  const slideView = getSlideView(frame)

  return (
    <AbsoluteFill style={{
      background: BG,
      fontFamily: 'system-ui, -apple-system, sans-serif',
      perspective: 1200,
      opacity: globalOpacity,
    }}>
      <DesktopBackground frame={frame} />

      {/* Terminal window -- sits behind editor in IDE phase */}
      <div style={{
        position: 'absolute',
        top: `${terminalTop}%`,
        left: `${terminalLeft}%`,
        width: `${terminalWidth}%`,
        height: `${terminalHeight}%`,
        opacity: terminalOpacity,
        transform: `
          translateY(${terminalInitialY + terminalBob + terminalSettle}px)
          rotateY(${terminalRotateY}deg)
          scale(${terminalScale})
        `,
        transformStyle: 'preserve-3d',
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid ${BORDER_COLOR}`,
        background: '#0a0a0a',
        boxShadow: terminalShadow,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1,
      }}>
        <WindowChrome title="Terminal" />
        <div style={{ flex: 1, padding: 14, overflow: 'hidden' }}>
          <TerminalContent />
        </div>
      </div>

      {/* Editor window -- appears in IDE phase, overlaps terminal */}
      {showEditor && (
        <div style={{
          position: 'absolute',
          top: '4%',
          left: '1%',
          width: '46%',
          height: '52%',
          opacity: editorOpacity,
          transform: `
            translateY(${editorY + editorBob}px)
            rotateX(${editorRotateX}deg)
          `,
          transformStyle: 'preserve-3d',
          borderRadius: 10,
          overflow: 'hidden',
          border: `1px solid ${BORDER_COLOR}`,
          background: '#1a1a1f',
          boxShadow: editorShadow,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 2,
        }}>
          <WindowChrome title="page.tsx" accentDot />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <EditorContent />
          </div>
        </div>
      )}

      {/* Browser window */}
      {showBrowser && (
        <div style={{
          position: 'absolute',
          top: '6%',
          right: '2%',
          width: '48%',
          height: '88%',
          opacity: browserOpacity,
          transform: `
            translateX(${browserX}px)
            translateY(${browserBob}px)
            scale(${browserScale})
            rotateY(${browserRotateY}deg)
          `,
          transformStyle: 'preserve-3d',
          borderRadius: 10,
          overflow: 'hidden',
          border: `1px solid ${BORDER_COLOR}`,
          background: '#0a0a0a',
          boxShadow: browserShadow,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 3,
        }}>
          <BrowserChrome url="localhost:3000" />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <SlidePreviewScenes view={slideView} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  )
}
