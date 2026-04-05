import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from './route'

const mockInsert = vi.fn()
const mockSelectQuery = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn((table: string) => {
      if (table === 'word_cloud_entries') {
        return {
          insert: mockInsert,
          select: () => ({
            eq: () => ({
              eq: mockSelectQuery,
            }),
          }),
        }
      }
      return {}
    }),
  }),
}))

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue('127.0.0.1'),
  }),
}))

const makePostRequest = (body: Record<string, unknown>): Request =>
  new Request('http://localhost:3000/api/live/session-1/wordcloud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const makeGetRequest = (params = ''): Request =>
  new Request(`http://localhost:3000/api/live/session-1/wordcloud${params}`, { method: 'GET' })

const routeContext = { params: Promise.resolve({ sessionId: 'session-1' }) }

describe('POST /api/live/[sessionId]/wordcloud', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should submit a word', async () => {
    mockInsert.mockResolvedValue({ error: null })

    const response = await POST(makePostRequest({ word: 'React' }), routeContext)
    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.ok).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        session_id: 'session-1',
        word: 'react',
        slide_index: 0,
      }),
    )
  })

  it('should reject empty word', async () => {
    const response = await POST(makePostRequest({ word: '' }), routeContext)

    expect(response.status).toBe(400)
  })

  it('should reject word over 50 characters', async () => {
    const response = await POST(makePostRequest({ word: 'a'.repeat(51) }), routeContext)

    expect(response.status).toBe(400)
  })

  it('should return 409 for duplicate submission', async () => {
    mockInsert.mockResolvedValue({ error: { code: '23505', message: 'unique violation' } })

    const response = await POST(makePostRequest({ word: 'React' }), routeContext)

    expect(response.status).toBe(409)
  })
})

describe('GET /api/live/[sessionId]/wordcloud', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return aggregated word counts', async () => {
    const entries = [
      { word: 'react' },
      { word: 'react' },
      { word: 'vue' },
    ]
    mockSelectQuery.mockResolvedValue({ data: entries, error: null })

    const response = await GET(makeGetRequest('?slide_index=0'), routeContext)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual([
      { word: 'react', count: 2 },
      { word: 'vue', count: 1 },
    ])
  })

  it('should return empty array when no entries', async () => {
    mockSelectQuery.mockResolvedValue({ data: [], error: null })

    const response = await GET(makeGetRequest('?slide_index=0'), routeContext)
    const body = await response.json()

    expect(body).toEqual([])
  })
})
