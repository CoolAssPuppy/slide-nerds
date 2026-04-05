'use client'

import { useEffect } from 'react'

type ViewTrackerProps = {
  deckId: string
  shareToken?: string
}

type TrackingOptions = {
  deckId: string
  shareToken?: string
}

export function startTracking(options: TrackingOptions): () => void {
  const { deckId, shareToken } = options
  const analyticsUrl = `/api/decks/${deckId}/analytics`
  const startTime = Date.now()
  let cancelled = false

  const payload: Record<string, unknown> = {
    slide_index: 0,
    dwell_seconds: 0,
  }

  if (shareToken) {
    payload.share_link_id = shareToken
  }

  const timerId = setTimeout(() => {
    if (cancelled) return

    fetch(analyticsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {
      // Tracking failure should not affect the viewer
    })
  }, 0)

  return () => {
    cancelled = true
    clearTimeout(timerId)
    const dwellSeconds = Math.floor((Date.now() - startTime) / 1000)

    if (dwellSeconds < 1) return

    const dwellPayload: Record<string, unknown> = {
      slide_index: 0,
      dwell_seconds: dwellSeconds,
    }

    if (shareToken) {
      dwellPayload.share_link_id = shareToken
    }

    const blob = new Blob([JSON.stringify(dwellPayload)], {
      type: 'application/json',
    })

    navigator.sendBeacon(analyticsUrl, blob)
  }
}

export function ViewTracker({ deckId, shareToken }: ViewTrackerProps) {
  useEffect(() => {
    const cleanup = startTracking({ deckId, shareToken })

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        cleanup()
      }
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      cleanup()
    }
  }, [deckId, shareToken])

  return null
}
