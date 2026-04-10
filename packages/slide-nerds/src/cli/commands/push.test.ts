import { describe, expect, it, vi } from 'vitest'
import { checkPushAccess } from './push.js'

describe('checkPushAccess', () => {
  it('returns true when push is enabled', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ push_enabled: true }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const isEnabled = await checkPushAccess({
      serviceUrl: 'https://www.slidenerds.com',
      accessToken: 'token',
    })

    expect(isEnabled).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith('https://www.slidenerds.com/api/cli/push-access', {
      headers: {
        Authorization: 'Bearer token',
      },
    })
  })

  it('returns false when push is disabled', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ push_enabled: false }),
    }))

    const isEnabled = await checkPushAccess({
      serviceUrl: 'https://www.slidenerds.com',
      accessToken: 'token',
    })

    expect(isEnabled).toBe(false)
  })

  it('throws unauthorized for expired sessions', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn(),
    }))

    await expect(checkPushAccess({
      serviceUrl: 'https://www.slidenerds.com',
      accessToken: 'token',
    })).rejects.toThrow('Unauthorized')
  })
})
