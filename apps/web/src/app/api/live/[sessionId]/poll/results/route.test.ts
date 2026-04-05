import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

const mockPollsQuery = vi.fn()
const mockVotesQuery = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: vi.fn((table: string) => {
      if (table === 'polls') {
        return { select: () => ({ eq: () => ({ order: mockPollsQuery }) }) }
      }
      if (table === 'poll_votes') {
        return { select: () => ({ in: mockVotesQuery }) }
      }
      return {}
    }),
  }),
}))

const makeGetRequest = (): Request =>
  new Request('http://localhost:3000/api/live/session-1/poll/results', { method: 'GET' })

const routeContext = { params: Promise.resolve({ sessionId: 'session-1' }) }

describe('GET /api/live/[sessionId]/poll/results', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array when no polls exist', async () => {
    mockPollsQuery.mockResolvedValue({ data: [], error: null })

    const response = await GET(makeGetRequest(), routeContext)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual([])
  })

  it('should return aggregated poll results with vote counts', async () => {
    const polls = [
      {
        id: 'poll-1',
        question: 'Favorite color?',
        options: '["Red","Blue","Green"]',
        is_active: true,
        slide_index: 0,
      },
    ]

    const votes = [
      { poll_id: 'poll-1', option_index: 0 },
      { poll_id: 'poll-1', option_index: 0 },
      { poll_id: 'poll-1', option_index: 1 },
    ]

    mockPollsQuery.mockResolvedValue({ data: polls, error: null })
    mockVotesQuery.mockResolvedValue({ data: votes, error: null })

    const response = await GET(makeGetRequest(), routeContext)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toHaveLength(1)
    expect(body[0].question).toBe('Favorite color?')
    expect(body[0].total_votes).toBe(3)
    expect(body[0].options[0]).toEqual({ label: 'Red', index: 0, votes: 2 })
    expect(body[0].options[1]).toEqual({ label: 'Blue', index: 1, votes: 1 })
    expect(body[0].options[2]).toEqual({ label: 'Green', index: 2, votes: 0 })
  })

  it('should handle polls with no votes', async () => {
    const polls = [
      {
        id: 'poll-1',
        question: 'Test?',
        options: '["A","B"]',
        is_active: true,
        slide_index: 0,
      },
    ]

    mockPollsQuery.mockResolvedValue({ data: polls, error: null })
    mockVotesQuery.mockResolvedValue({ data: [], error: null })

    const response = await GET(makeGetRequest(), routeContext)
    const body = await response.json()

    expect(body[0].total_votes).toBe(0)
    expect(body[0].options[0].votes).toBe(0)
    expect(body[0].options[1].votes).toBe(0)
  })

  it('should return 500 on polls query error', async () => {
    mockPollsQuery.mockResolvedValue({ data: null, error: { message: 'DB error' } })

    const response = await GET(makeGetRequest(), routeContext)

    expect(response.status).toBe(500)
  })
})
