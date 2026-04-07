'use client'

import { useCurrentFrame } from 'remotion'

import {
  ACCENT, MUTED, DIM, BORDER_COLOR, SURFACE,
  EDITOR_CODE, IDE_TYPING_START, IDE_CODE_CHARS_PER_FRAME,
} from './constants'

// Simple JSX syntax coloring
type TokenType = 'tag' | 'attr' | 'string' | 'text' | 'punct'

type Token = { text: string; type: TokenType }

const colorMap: Record<TokenType, string> = {
  tag: '#7dd3fc',     // sky blue for JSX tags
  attr: '#c4b5fd',    // violet for attributes
  string: '#86efac',  // green for strings
  text: '#e8e6e3',    // default text
  punct: '#888',      // gray for brackets/punctuation
}

const tokenizeLine = (line: string): Token[] => {
  const tokens: Token[] = []
  let remaining = line

  // Leading whitespace
  const leadingMatch = remaining.match(/^(\s+)/)
  if (leadingMatch) {
    tokens.push({ text: leadingMatch[1], type: 'text' })
    remaining = remaining.slice(leadingMatch[1].length)
  }

  while (remaining.length > 0) {
    // String literals
    const strMatch = remaining.match(/^("[^"]*"|'[^']*')/)
    if (strMatch) {
      tokens.push({ text: strMatch[1], type: 'string' })
      remaining = remaining.slice(strMatch[1].length)
      continue
    }

    // JSX opening/closing tags: <TagName or </TagName or />
    const tagMatch = remaining.match(/^(<\/?)([\w.]+)/)
    if (tagMatch) {
      tokens.push({ text: tagMatch[1], type: 'punct' })
      tokens.push({ text: tagMatch[2], type: 'tag' })
      remaining = remaining.slice(tagMatch[0].length)
      continue
    }

    // Closing bracket
    const closeBracket = remaining.match(/^(\/>|>)/)
    if (closeBracket) {
      tokens.push({ text: closeBracket[1], type: 'punct' })
      remaining = remaining.slice(closeBracket[1].length)
      continue
    }

    // Attribute names (word followed by =)
    const attrMatch = remaining.match(/^([\w-]+)(=)/)
    if (attrMatch) {
      tokens.push({ text: attrMatch[1], type: 'attr' })
      tokens.push({ text: attrMatch[2], type: 'punct' })
      remaining = remaining.slice(attrMatch[0].length)
      continue
    }

    // className special case
    const classMatch = remaining.match(/^(className)/)
    if (classMatch) {
      tokens.push({ text: classMatch[1], type: 'attr' })
      remaining = remaining.slice(classMatch[1].length)
      continue
    }

    // JSX expression braces
    const braceMatch = remaining.match(/^([{}])/)
    if (braceMatch) {
      tokens.push({ text: braceMatch[1], type: 'punct' })
      remaining = remaining.slice(1)
      continue
    }

    // Plain text (up to next special char)
    const textMatch = remaining.match(/^([^<>"'{}=\s]+|\s+)/)
    if (textMatch) {
      tokens.push({ text: textMatch[1], type: 'text' })
      remaining = remaining.slice(textMatch[1].length)
      continue
    }

    // Fallback: single char
    tokens.push({ text: remaining[0], type: 'text' })
    remaining = remaining.slice(1)
  }

  return tokens
}

// Cursor component
const Cursor = ({ visible }: { visible: boolean }) => (
  <span style={{
    display: 'inline-block',
    width: 1.5,
    height: 13,
    background: visible ? '#e8e6e3' : 'transparent',
    marginLeft: 1,
    verticalAlign: 'text-bottom',
  }} />
)

export function EditorContent() {
  const frame = useCurrentFrame()

  const elapsed = Math.max(0, frame - IDE_TYPING_START)
  const charCount = Math.min(EDITOR_CODE.length, Math.floor(elapsed * IDE_CODE_CHARS_PER_FRAME))
  const visibleCode = EDITOR_CODE.slice(0, charCount)
  const isComplete = charCount >= EDITOR_CODE.length
  const cursorVisible = frame % 20 < 14

  const lines = visibleCode.split('\n')

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
      fontSize: 11,
      lineHeight: 1.7,
    }}>
      {/* Mini file tree sidebar */}
      <div style={{
        width: 36,
        background: '#111114',
        borderRight: `1px solid ${BORDER_COLOR}`,
        padding: '8px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        {/* File icon indicators */}
        {[ACCENT, '#7dd3fc', DIM, DIM].map((color, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 3,
            background: i === 0 ? `${color}22` : 'transparent',
            border: i === 0 ? `1px solid ${color}44` : `1px solid ${BORDER_COLOR}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: 1, background: color, opacity: 0.6 }} />
          </div>
        ))}
      </div>

      {/* Editor body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Tab bar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          background: '#111114',
          borderBottom: `1px solid ${BORDER_COLOR}`,
          height: 28,
          flexShrink: 0,
        }}>
          <div style={{
            padding: '0 12px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: SURFACE,
            borderRight: `1px solid ${BORDER_COLOR}`,
            borderBottom: `2px solid ${ACCENT}`,
          }}>
            <span style={{ fontSize: 9, color: '#7dd3fc' }}>{'<>'}</span>
            <span style={{ fontSize: 10, color: '#ccc' }}>page.tsx</span>
            <span style={{ fontSize: 8, color: DIM, marginLeft: 4 }}>x</span>
          </div>
        </div>

        {/* Code area */}
        <div style={{ flex: 1, padding: '8px 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* File context line */}
            <div style={{ display: 'flex', paddingLeft: 4, opacity: 0.4 }}>
              <span style={{ width: 28, textAlign: 'right', color: DIM, marginRight: 12, fontSize: 10, userSelect: 'none' }}>42</span>
              <span style={{ color: MUTED }}>{'// Slide 7: Call to action'}</span>
            </div>

            {/* Typed code lines */}
            {lines.map((line, i) => {
              const tokens = tokenizeLine(line)
              const isLastLine = i === lines.length - 1 && !isComplete
              return (
                <div key={i} style={{ display: 'flex', paddingLeft: 4 }}>
                  <span style={{
                    width: 28, textAlign: 'right', color: DIM, marginRight: 12,
                    fontSize: 10, userSelect: 'none',
                  }}>
                    {43 + i}
                  </span>
                  <span>
                    {tokens.map((token, j) => (
                      <span key={j} style={{ color: colorMap[token.type], whiteSpace: 'pre' }}>
                        {token.text}
                      </span>
                    ))}
                    {isLastLine && <Cursor visible={cursorVisible} />}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
