export type ChatToolStatus = 'pending' | 'running' | 'done' | 'error'

export type ChatTool = {
  name: string
  detail?: string
  status?: ChatToolStatus
}

export type ChatArtifact = {
  title: string
  kind?: 'document' | 'code' | 'image'
}

export type ChatMessage = {
  role: 'user' | 'assistant'
  text: string
  thinking?: boolean
  tools?: ReadonlyArray<ChatTool>
  artifact?: ChatArtifact
}

export type ChatScrollSpeed = 'instant' | 'natural' | 'slow'

export type ClaudeChatProps = {
  title?: string
  model?: string
  messages: ReadonlyArray<ChatMessage>
  height?: number | string
  autoScroll?: boolean
  scrollSpeed?: ChatScrollSpeed
  startDelay?: number
  messageDelay?: number
  className?: string
  style?: React.CSSProperties
}
