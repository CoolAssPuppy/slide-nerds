'use client'

import React, { useState, useCallback, useRef } from 'react'

import { useLiveApi, usePolling, useHasMounted } from './use-live-session.js'
import type { LiveComponentProps, PollResult } from './types.js'

type LivePollProps = LiveComponentProps & {
  question: string
  options: string[]
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '24px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '500px',
    width: '100%',
  } as React.CSSProperties,
  question: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 16px 0',
  } as React.CSSProperties,
  optionButton: {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    marginBottom: '8px',
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontSize: '15px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'background 0.15s ease, border-color 0.15s ease',
  } as React.CSSProperties,
  optionButtonHover: {
    background: 'rgba(62, 207, 142, 0.2)',
    borderColor: 'rgba(62, 207, 142, 0.5)',
  } as React.CSSProperties,
  resultRow: {
    marginBottom: '12px',
  } as React.CSSProperties,
  resultLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
    fontSize: '14px',
    color: '#fff',
  } as React.CSSProperties,
  resultBarTrack: {
    width: '100%',
    height: '8px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  } as React.CSSProperties,
  resultBarFill: (percentage: number) =>
    ({
      width: `${percentage}%`,
      height: '100%',
      borderRadius: '4px',
      background: 'linear-gradient(90deg, #3ECF8E, #2BA86C)',
      transition: 'width 0.4s ease',
    }) as React.CSSProperties,
  totalVotes: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '8px',
  } as React.CSSProperties,
  voted: {
    fontSize: '13px',
    color: '#3ECF8E',
    marginTop: '4px',
  } as React.CSSProperties,
  noSession: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontStyle: 'italic',
  } as React.CSSProperties,
}

export const LivePoll: React.FC<LivePollProps> = ({
  question,
  options,
  sessionId,
  sessionName,
  deckId,
  serviceUrl,
}) => {
  const mounted = useHasMounted()
  const { post, get } = useLiveApi({ sessionId, sessionName, deckId, serviceUrl })
  const [hasVoted, setHasVoted] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const hasCreatedRef = useRef(false)

  const ensurePollExists = useCallback(async (): Promise<PollResult | null> => {
    const response = await get('/poll/results')
    if (!response || !response.ok) return null

    const results: PollResult[] = await response.json()
    const match = results.find((r) => r.question === question)
    if (match) return match

    if (!hasCreatedRef.current) {
      hasCreatedRef.current = true
      const createResp = await post('/poll', {
        question,
        options,
        slide_index: 0,
      })
      if (createResp && createResp.ok) {
        const created = await createResp.json()
        return {
          id: created.id,
          question,
          slide_index: 0,
          is_active: true,
          total_votes: 0,
          options: options.map((label, index) => ({ label, index, votes: 0 })),
        }
      }
    }

    return null
  }, [get, post, question, options])

  const { data: pollResult } = usePolling(ensurePollExists)

  const handleVote = async (optionIndex: number) => {
    if (hasVoted) return

    const pollId = pollResult?.id
    if (!pollId) return

    const response = await post('/vote', {
      poll_id: pollId,
      option_index: optionIndex,
    })

    if (response && (response.ok || response.status === 409)) {
      setHasVoted(true)
    }
  }

  const resolvedSessionId = useLiveApi({ sessionId, sessionName, deckId, serviceUrl }).sessionId
  if (!mounted || !resolvedSessionId) {
    return (
      <div style={styles.container}>
        <p style={styles.noSession}>{mounted ? 'No live session active' : ''}</p>
      </div>
    )
  }

  const showResults = hasVoted && pollResult

  return (
    <div style={styles.container}>
      <p style={styles.question}>{question}</p>

      {!showResults && (
        <div>
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              style={{
                ...styles.optionButton,
                ...(hoveredIndex === index ? styles.optionButtonHover : {}),
              }}
              onClick={() => handleVote(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {showResults && (
        <div>
          {pollResult.options.map((option) => {
            const percentage =
              pollResult.total_votes > 0
                ? Math.round((option.votes / pollResult.total_votes) * 100)
                : 0

            return (
              <div key={option.index} style={styles.resultRow}>
                <div style={styles.resultLabel}>
                  <span>{option.label}</span>
                  <span>
                    {percentage}% ({option.votes})
                  </span>
                </div>
                <div style={styles.resultBarTrack}>
                  <div style={styles.resultBarFill(percentage)} />
                </div>
              </div>
            )
          })}
          <p style={styles.totalVotes}>{pollResult.total_votes} total votes</p>
          <p style={styles.voted}>Vote recorded</p>
        </div>
      )}
    </div>
  )
}
