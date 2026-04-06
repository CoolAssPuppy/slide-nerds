// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const DECK_ID = 'deck-abc-123'
const ANALYTICS_URL = `/api/decks/${DECK_ID}/analytics`

type BeaconFn = (url: string, data: Blob) => boolean

describe('ViewTracker', () => {
  let originalSendBeacon: BeaconFn | undefined
  let fetchCalls: Array<{ url: string; body: unknown; keepalive?: boolean }>
  let beaconCalls: Array<{ url: string; body: unknown }>

  beforeEach(() => {
    vi.useFakeTimers()
    fetchCalls = []
    beaconCalls = []

    globalThis.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      fetchCalls.push({
        url: String(input),
        body: JSON.parse(String(init?.body)),
        keepalive: init?.keepalive,
      })
      return Promise.resolve(new Response('{}', { status: 201 }))
    })

    originalSendBeacon = navigator.sendBeacon as BeaconFn | undefined
    navigator.sendBeacon = vi.fn(((url: string, data: Blob) => {
      beaconCalls.push({ url, body: data })
      return true
    }) as BeaconFn)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    if (originalSendBeacon) {
      navigator.sendBeacon = originalSendBeacon
    }
  })

  async function createTracker(options: {
    deckId: string
    shareToken?: string
  }): Promise<{ cleanup: () => void }> {
    const { startTracking } = await import('./ViewTracker')
    const cleanup = startTracking(options)
    return { cleanup }
  }

  it('records an initial view on start', async () => {
    const { cleanup } = await createTracker({ deckId: DECK_ID })

    await vi.advanceTimersByTimeAsync(0)

    expect(fetchCalls).toHaveLength(1)
    expect(fetchCalls[0].url).toBe(ANALYTICS_URL)
    expect(fetchCalls[0].body).toEqual({
      slide_index: 0,
      dwell_seconds: 0,
    })

    cleanup()
  })

  it('includes share_link_id when shareToken is provided', async () => {
    const { cleanup } = await createTracker({
      deckId: DECK_ID,
      shareToken: 'share-token-xyz',
    })

    await vi.advanceTimersByTimeAsync(0)

    expect(fetchCalls).toHaveLength(1)
    expect(fetchCalls[0].body).toEqual({
      slide_index: 0,
      dwell_seconds: 0,
      share_link_id: 'share-token-xyz',
    })

    cleanup()
  })

  it('sends dwell time via sendBeacon on cleanup', async () => {
    const { cleanup } = await createTracker({ deckId: DECK_ID })

    await vi.advanceTimersByTimeAsync(0)

    vi.advanceTimersByTime(15_000)

    cleanup()

    expect(beaconCalls).toHaveLength(1)
    expect(beaconCalls[0].url).toBe(ANALYTICS_URL)

    expect(beaconCalls[0].url).toBe(ANALYTICS_URL)
    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1)
  })

  it('does not send dwell beacon if less than 1 second elapsed', async () => {
    const { cleanup } = await createTracker({ deckId: DECK_ID })

    await vi.advanceTimersByTimeAsync(0)

    vi.advanceTimersByTime(500)

    cleanup()

    expect(beaconCalls).toHaveLength(0)
  })

  it('does not send initial view if already cleaned up', async () => {
    const { cleanup } = await createTracker({ deckId: DECK_ID })

    cleanup()

    await vi.advanceTimersByTimeAsync(0)

    expect(fetchCalls).toHaveLength(0)
  })
})
