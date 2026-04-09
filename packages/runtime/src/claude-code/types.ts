export type ClaudeCodeLineKind =
  | 'banner'
  | 'welcome'
  | 'tip'
  | 'prompt'
  | 'claude'
  | 'working'
  | 'tool'
  | 'toolResult'
  | 'file'
  | 'success'
  | 'blank'

export type ClaudeCodeLine = {
  kind: ClaudeCodeLineKind
  text?: string
  gutter?: string
}

export type ClaudeCodeProps = {
  cwd?: string
  model?: string
  banner?: boolean
  welcome?: boolean
  session: ReadonlyArray<ClaudeCodeLine>
  height?: number | string
  autoScroll?: boolean
  typewriter?: boolean
  linesPerSecond?: number
  showCursor?: boolean
  startDelay?: number
  className?: string
  style?: React.CSSProperties
}
