import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSingle = vi.fn()
const mockRpc = vi.fn()
const mockUpdateResult = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn(() => {
      const chain: Record<string, unknown> = {}
      chain.eq = vi.fn().mockImplementation(() => {
        const inner: Record<string, unknown> = {}
        inner.single = mockSingle
        inner.eq = mockUpdateResult
        return inner
      })
      chain.select = vi.fn().mockReturnValue(chain)
      chain.update = vi.fn().mockReturnValue(chain)
      return chain
    }),
    rpc: mockRpc,
  })),
}))

const makeGetRequest = (): Request =>
  new Request('http://localhost:3000/api/live/session-1/audience', { method: 'GET' })

const makePostRequest = (body: Record<string, unknown>): Request =>
  new Request('http://localhost:3000/api/live/session-1/audience', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

const routeContext = { params: Promise.resolve({ sessionId: 'session-1' }) }

describe('GET /api/live/[sessionId]/audience', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return audience count', async () => {
    const { GET } = await import('./route')
    mockSingle.mockResolvedValue({
      data: { audience_count: 42, status: 'active' },
      error: null,
    })

    const response = await GET(makeGetRequest(), routeContext)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual({ count: 42, status: 'active' })
  })

  it('should return 404 for missing session', async () => {
    const { GET } = await import('./route')
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

    const response = await GET(makeGetRequest(), routeContext)

    expect(response.status).toBe(404)
  })
})

describe('POST /api/live/[sessionId]/audience', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should increment audience count on join', async () => {
    const { POST } = await import('./route')
    mockRpc.mockResolvedValue({ error: null })

    const response = await POST(makePostRequest({ action: 'join' }), routeContext)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('increment_audience_count', {
      p_session_id: 'session-1',
      p_increment: 1,
    })
  })

  it('should decrement audience count on leave', async () => {
    const { POST } = await import('./route')
    mockRpc.mockResolvedValue({ error: null })

    const response = await POST(makePostRequest({ action: 'leave' }), routeContext)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(mockRpc).toHaveBeenCalledWith('increment_audience_count', {
      p_session_id: 'session-1',
      p_increment: -1,
    })
  })

  it('should reject invalid action', async () => {
    const { POST } = await import('./route')

    const response = await POST(makePostRequest({ action: 'invalid' }), routeContext)

    expect(response.status).toBe(400)
  })

  it('should fallback to update when rpc fails', async () => {
    const { POST } = await import('./route')
    mockRpc.mockResolvedValue({ error: { message: 'RPC not found' } })
    mockUpdateResult.mockResolvedValue({ error: null })

    const response = await POST(makePostRequest({ action: 'join' }), routeContext)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
  })
})
