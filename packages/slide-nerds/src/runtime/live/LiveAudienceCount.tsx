'use client'

import React, { useCallback, useEffect, useRef } from 'react'

import { useLiveApi, usePolling } from './use-live-session.js'
import type { LiveComponentProps, AudienceInfo } from './types.js'

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '20px',
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#3ECF8E',
    animation: 'slidenerds-pulse 2s ease-in-out infinite',
  } as React.CSSProperties,
  text: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 500,
  } as React.CSSProperties,
  noSession: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontStyle: 'italic',
  } as React.CSSProperties,
}

const PULSE_KEYFRAMES = `
@keyframes slidenerds-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
`

const injectStyles = () => {
  if (typeof document === 'undefined') return
  const styleId = 'slidenerds-live-styles'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = PULSE_KEYFRAMES
  document.head.appendChild(style)
}

export const LiveAudienceCount: React.FC<LiveComponentProps> = ({ sessionId, serviceUrl }) => {
  const { post, get, sessionId: resolvedSessionId, serviceUrl: resolvedServiceUrl } = useLiveApi({
    sessionId,
    serviceUrl,
  })
  const hasJoinedRef = useRef(false)

  useEffect(() => {
    injectStyles()
  }, [])

  useEffect(() => {
    if (!resolvedSessionId || hasJoinedRef.current) return

    hasJoinedRef.current = true
    post('/audience', { action: 'join' })

    const leaveUrl = `${resolvedServiceUrl}/api/live/${resolvedSessionId}/audience`

    const handleBeforeUnload = () => {
      navigator.sendBeacon(leaveUrl, JSON.stringify({ action: 'leave' }))
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      post('/audience', { action: 'leave' })
      hasJoinedRef.current = false
    }
  }, [resolvedSessionId, resolvedServiceUrl, post])

  const fetchAudience = useCallback(async (): Promise<AudienceInfo | null> => {
    const response = await get('/audience')
    if (!response || !response.ok) return null
    return response.json()
  }, [get])

  const { data: audience } = usePolling(fetchAudience)

  if (!resolvedSessionId) {
    return <span style={styles.noSession}>No live session</span>
  }

  const count = audience?.count ?? 0

  return (
    <div style={styles.container}>
      <span style={styles.dot} />
      <span style={styles.text}>
        {count} watching
      </span>
    </div>
  )
}
