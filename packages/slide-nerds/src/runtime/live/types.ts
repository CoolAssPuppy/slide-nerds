export type ReactionType = 'thumbsup' | 'clap' | 'heart' | 'fire' | 'mind_blown'

export type LiveComponentProps = {
  sessionId?: string
  serviceUrl?: string
}

export type PollOption = {
  label: string
  index: number
  votes: number
}

export type PollResult = {
  id: string
  question: string
  slide_index: number
  is_active: boolean
  total_votes: number
  options: PollOption[]
}

export type QAQuestion = {
  id: string
  content: string
  author_name: string | null
  is_answered: boolean
  slide_index: number
  created_at: string
}

export type WordCloudEntry = {
  word: string
  count: number
}

export type Reaction = {
  id: string
  type: ReactionType
  created_at: string
}

export type AudienceInfo = {
  count: number
  status: string
}
