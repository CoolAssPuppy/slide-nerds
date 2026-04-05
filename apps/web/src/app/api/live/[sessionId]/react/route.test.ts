import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from './route'

const mockInsert = vi.fn()
const mockQueryResult = vi.fn()

const createChain = () => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  chain.eq = vi.fn().mockReturnValue(chain)
  chain.gt = vi.fn().mockReturnValue(chain)
  chain.order = vi.fn().mockReturnValue(chain)
  chain.limit = mockQueryResult
  chain.select = vi.fn().mockReturnValue(chain)
  return chain
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn(() => {
      const chain = createChain()
      chain.insert = mockInsert
      return chain
    }),
  }),
}))

const makeRequest = (body: Record<string, unknown>): Request =>
  new Request('http://localhost:3000/api/live/session-1/react', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const makeGetRequest = (url = 'http://localhost:3000/api/live/session-1/react'): Request =>
  new Request(url, { method: 'GET' })

const routeContext = { params: Promise.resolve({ sessionId: 'session-1' }) }

describe('POST /api/live/[sessionId]/react', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a reaction with valid type', async () => {
    mockInsert.mockResolvedValue({ error: null })

    const response = await POST(makeRequest({ type: 'thumbsup' }), routeContext)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.ok).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith({
      session_id: 'session-1',
      type: 'thumbsup',
    })
  })

  it('should reject invalid reaction type', async () => {
    const response = await POST(makeRequest({ type: 'invalid' }), routeContext)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toContain('Invalid reaction type')
  })

  it('should reject missing reaction type', async () => {
    const response = await POST(makeRequest({}), routeContext)

    expect(response.status).toBe(400)
  })

  it('should return 500 on database error', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'DB error' } })

    const response = await POST(makeRequest({ type: 'heart' }), routeContext)

    expect(response.status).toBe(500)
  })
})

describe('GET /api/live/[sessionId]/react', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return recent reactions', async () => {
    const mockReactions = [
      { id: '1', type: 'thumbsup', created_at: '2026-01-01T00:00:00Z' },
    ]

    mockQueryResult.mockResolvedValue({ data: mockReactions, error: null })

    const response = await GET(makeGetRequest(), routeContext)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(mockReactions)
  })

  it('should return empty array on error', async () => {
    mockQueryResult.mockResolvedValue({ data: null, error: { message: 'error' } })

    const response = await GET(makeGetRequest(), routeContext)

    expect(response.status).toBe(500)
  })
})
