'use client'

import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion'

import {
  COMMANDS, INTERACTIONS, INTERACTION_FRAMES,
  CLAUDE_ORANGE, CLAUDE_BG, CLAUDE_BORDER,
  CMD_1_START, CMD_2_START, CMD_3_START, CMD_4_START,
  CMD_CLAUDE_START, CLAUDE_UI_START,
  getTypedText, typingEndFrame,
} from './constants'

// Blinking cursor: visible most of each cycle
const Cursor = () => {
  const frame = useCurrentFrame()
  const visible = frame % 20 < 14
  return <span style={{ opacity: visible ? 1 : 0 }}>|</span>
}

// Thinking dots animated with frame math
function ThinkingDots() {
  const frame = useCurrentFrame()
  return (
    <span style={{ display: 'inline-flex', gap: 3, marginLeft: 4 }}>
      {[0, 1, 2].map((i) => {
        const cycle = (frame + i * 5) % 15
        const y = interpolate(cycle, [0, 7, 15], [0, -4, 0])
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
              background: CLAUDE_ORANGE,
              transform: `translateY(${y}px)`,
            }}
          />
        )
      })}
    </span>
  )
}

// Completed command line
function CompletedLine({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex' }}>
      <span style={{ color: '#3ECF8E', marginRight: 8, userSelect: 'none' }}>$</span>
      <span>{text}</span>
    </div>
  )
}

// Actively typing command line
function TypingLine({ text, startFrame }: { text: string; startFrame: number }) {
  const frame = useCurrentFrame()
  const { display, complete } = getTypedText(text, startFrame, frame)
  return (
    <div style={{ display: 'flex' }}>
      <span style={{ color: '#3ECF8E', marginRight: 8, userSelect: 'none' }}>$</span>
      <span>{display}</span>
      {!complete && <Cursor />}
    </div>
  )
}

// Claude interaction block (prompt + thinking/result)
function ClaudeInteraction({ index }: { index: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const interaction = INTERACTIONS[index]
  const frames = INTERACTION_FRAMES[index]

  const isTyping = frame >= frames.promptStart && frame < frames.thinkingStart
  const isThinking = frame >= frames.thinkingStart && frame < frames.doneStart
  const isDone = frame >= frames.doneStart

  if (frame < frames.promptStart) return null

  const { display: typedPrompt } = getTypedText(interaction.prompt, frames.promptStart, frame)

  // Spring in the result text
  const resultProgress = spring({
    frame: frame - frames.doneStart,
    fps,
    config: { damping: 14, stiffness: 120 },
  })
  const resultOpacity = interpolate(resultProgress, [0, 1], [0, 1])

  return (
    <div style={{ marginBottom: 10 }}>
      {/* Prompt text */}
      <div style={{ fontSize: 11, lineHeight: 1.5, color: isDone ? '#a08b7a' : '#e0e0e0' }}>
        {isTyping ? (
          <>{typedPrompt}<Cursor /></>
        ) : (
          interaction.prompt
        )}
      </div>

      {/* Thinking state */}
      {isThinking && (
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#a08b7a' }}>
          <span>Thinking</span>
          <ThinkingDots />
        </div>
      )}

      {/* Result */}
      {isDone && (
        <div style={{ marginTop: 4, fontSize: 11, color: CLAUDE_ORANGE, fontWeight: 500, opacity: resultOpacity }}>
          {interaction.result}
        </div>
      )}
    </div>
  )
}

// Full terminal content -- pure function of frame
export function TerminalContent() {
  const frame = useCurrentFrame()

  const cmdStarts = [CMD_1_START, CMD_2_START, CMD_3_START, CMD_4_START]
  const cmdEnds = cmdStarts.map((start, i) => typingEndFrame(COMMANDS[i], start))

  // Which commands are fully typed?
  const completedCommands = COMMANDS.filter((_, i) => frame >= cmdEnds[i])

  // Which command is currently typing?
  const typingCmdIndex = cmdStarts.findIndex((start, i) => frame >= start && frame < cmdEnds[i])

  // Claude command
  const claudeStart = CMD_CLAUDE_START
  const claudeEnd = typingEndFrame('claude', claudeStart)
  const claudeComplete = frame >= claudeEnd
  const claudeTyping = frame >= claudeStart && frame < claudeEnd

  const showClaudeUI = frame >= CLAUDE_UI_START

  // Calculate scroll offset: shift content up as it grows
  const lineHeight = 22
  const visibleHeight = 290
  const completedLineCount = completedCommands.length
    + (claudeComplete ? 1 : 0)
    + (showClaudeUI ? 6 : 0) // approximate Claude UI height in lines
  const totalHeight = completedLineCount * lineHeight
  const scrollOffset = Math.max(0, totalHeight - visibleHeight)

  return (
    <div style={{
      fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
      fontSize: 13,
      color: '#e0e0e0',
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        transform: `translateY(-${scrollOffset}px)`,
      }}>
        {/* Completed commands */}
        {completedCommands.map((cmd) => (
          <CompletedLine key={cmd} text={cmd} />
        ))}

        {/* Currently typing command */}
        {typingCmdIndex >= 0 && (
          <TypingLine text={COMMANDS[typingCmdIndex]} startFrame={cmdStarts[typingCmdIndex]} />
        )}

        {/* Claude command */}
        {claudeTyping && <TypingLine text="claude" startFrame={claudeStart} />}
        {claudeComplete && !showClaudeUI && <CompletedLine text="claude" />}

        {/* Claude Code UI */}
        {showClaudeUI && (
          <>
            <CompletedLine text="claude" />
            <div style={{
              marginTop: 8,
              borderRadius: 8,
              border: `1px solid ${CLAUDE_BORDER}`,
              background: CLAUDE_BG,
              padding: 12,
            }}>
              {/* Claude header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', background: CLAUDE_ORANGE,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 700, color: 'white',
                }}>
                  C
                </div>
                <span style={{ color: CLAUDE_ORANGE, fontWeight: 700, fontSize: 12 }}>Claude Code</span>
              </div>

              {/* Interactions */}
              {INTERACTIONS.map((_, i) => (
                <ClaudeInteraction key={i} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
