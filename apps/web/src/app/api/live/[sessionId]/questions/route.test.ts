import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET, PATCH } from './route'

const mockInsertResult = vi.fn()
const mockSelectResult = vi.fn()
const mockUpdateResult = vi.fn()

const createChain = () => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue({ limit: mockSelectResult })
  chain.single = mockInsertResult
  chain.select = vi.fn().mockReturnValue(chain)
  chain.insert = vi.fn().mockReturnValue(chain)
  chain.update = vi.fn().mockReturnValue(chain)
  return chain
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn(() => createChain()),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
  }),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue('127.0.0.1'),
  }),
}))

const makePostRequest = (body: Record<string, unknown>): Request =>
  new Request('http://localhost:3000/api/live/session-1/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const makeGetRequest = (): Request =>
  new Request('http://localhost:3000/api/live/session-1/questions', { method: 'GET' })

const makePatchRequest = (body: Record<string, unknown>): Request =>
  new Request('http://localhost:3000/api/live/session-1/questions', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const routeContext = { params: Promise.resolve({ sessionId: 'session-1' }) }

describe('POST /api/live/[sessionId]/questions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a question', async () => {
    const question = {
      id: 'q-1',
      content: 'How does this work?',
      author_name: null,
      is_answered: false,
      session_id: 'session-1',
      slide_index: 0,
      created_at: '2026-01-01T00:00:00Z',
    }
    mockInsertResult.mockResolvedValue({ data: question, error: null })

    const response = await POST(makePostRequest({ content: 'How does this work?' }), routeContext)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.content).toBe('How does this work?')
  })

  it('should reject empty content', async () => {
    const response = await POST(makePostRequest({ content: '' }), routeContext)

    expect(response.status).toBe(400)
  })

  it('should reject content over 500 characters', async () => {
    const longContent = 'a'.repeat(501)
    const response = await POST(makePostRequest({ content: longContent }), routeContext)

    expect(response.status).toBe(400)
  })
})

describe('GET /api/live/[sessionId]/questions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return questions for session', async () => {
    const questions = [
      { id: 'q-1', content: 'Test?', author_name: null, is_answered: false, slide_index: 0, created_at: '2026-01-01' },
    ]
    mockSelectResult.mockResolvedValue({ data: questions, error: null })

    const response = await GET(makeGetRequest(), routeContext)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveLength(1)
  })
})

describe('PATCH /api/live/[sessionId]/questions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should mark a question as answered', async () => {
    mockUpdateResult.mockResolvedValue({ error: null })

    const response = await PATCH(
      makePatchRequest({ question_id: 'q-1', is_answered: true }),
      routeContext,
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
  })

  it('should reject missing fields', async () => {
    const response = await PATCH(makePatchRequest({}), routeContext)

    expect(response.status).toBe(400)
  })
})
