'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'

import { useLiveApi, usePolling } from './use-live-session.js'
import type { LiveComponentProps, Reaction, ReactionType } from './types.js'

const REACTION_EMOJI: Record<ReactionType, string> = {
  thumbsup: '\uD83D\uDC4D',
  clap: '\uD83D\uDC4F',
  heart: '\u2764\uFE0F',
  fire: '\uD83D\uDD25',
  mind_blown: '\uD83E\uDD2F',
}

const REACTION_TYPES: ReactionType[] = ['thumbsup', 'clap', 'heart', 'fire', 'mind_blown']

type FloatingReaction = {
  id: string
  emoji: string
  x: number
  createdAt: number
}

const styles = {
  container: {
    position: 'relative' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as React.CSSProperties,
  buttonRow: {
    display: 'flex',
    gap: '8px',
    padding: '8px',
    borderRadius: '24px',
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,
  reactionButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease, background 0.15s ease',
    padding: 0,
  } as React.CSSProperties,
  floatingArea: {
    position: 'absolute' as const,
    bottom: '100%',
    left: 0,
    right: 0,
    height: '200px',
    pointerEvents: 'none' as const,
    overflow: 'hidden',
  } as React.CSSProperties,
  floatingEmoji: (x: number, progress: number) =>
    ({
      position: 'absolute' as const,
      bottom: `${progress * 100}%`,
      left: `${x}%`,
      fontSize: '28px',
      opacity: 1 - progress,
      transform: `translateX(-50%) scale(${1 - progress * 0.3})`,
      transition: 'none',
      pointerEvents: 'none' as const,
    }) as React.CSSProperties,
  noSession: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontStyle: 'italic',
  } as React.CSSProperties,
}

export const LiveReactions: React.FC<LiveComponentProps> = ({ sessionId, serviceUrl }) => {
  const { post, get, sessionId: resolvedSessionId } = useLiveApi({ sessionId, serviceUrl })
  const [floating, setFloating] = useState<FloatingReaction[]>([])
  const lastFetchRef = useRef<string | null>(null)
  const frameRef = useRef<number>(0)

  const fetchReactions = useCallback(async (): Promise<Reaction[] | null> => {
    const since = lastFetchRef.current
    const path = since ? `/react?since=${encodeURIComponent(since)}` : '/react'
    const response = await get(path)
    if (!response || !response.ok) return null

    const reactions: Reaction[] = await response.json()
    if (reactions.length > 0) {
      lastFetchRef.current = reactions[0].created_at
    }
    return reactions
  }, [get])

  const { data: newReactions } = usePolling(fetchReactions)

  useEffect(() => {
    if (!newReactions || newReactions.length === 0) return

    const newFloating = newReactions.map((r) => ({
      id: r.id,
      emoji: REACTION_EMOJI[r.type],
      x: 10 + Math.random() * 80,
      createdAt: Date.now(),
    }))

    setFloating((prev) => [...prev, ...newFloating].slice(-50))
  }, [newReactions])

  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      setFloating((prev) => prev.filter((f) => now - f.createdAt < 3000))
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  const handleReact = async (type: ReactionType) => {
    await post('/react', { type })

    setFloating((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        emoji: REACTION_EMOJI[type],
        x: 10 + Math.random() * 80,
        createdAt: Date.now(),
      },
    ])
  }

  if (!resolvedSessionId) {
    return <p style={styles.noSession}>No live session active</p>
  }

  return (
    <div style={styles.container}>
      <div style={styles.floatingArea}>
        {floating.map((f) => {
          const progress = Math.min((Date.now() - f.createdAt) / 3000, 1)
          return (
            <span key={f.id} style={styles.floatingEmoji(f.x, progress)}>
              {f.emoji}
            </span>
          )
        })}
      </div>
      <div style={styles.buttonRow}>
        {REACTION_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            style={styles.reactionButton}
            onClick={() => handleReact(type)}
            aria-label={`React with ${type}`}
          >
            {REACTION_EMOJI[type]}
          </button>
        ))}
      </div>
    </div>
  )
}
