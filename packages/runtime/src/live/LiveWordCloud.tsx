'use client'

import React, { useState, useCallback } from 'react'

import { useLiveApi, usePolling } from './use-live-session.js'
import type { LiveComponentProps, WordCloudEntry } from './types.js'

type LiveWordCloudProps = LiveComponentProps & {
  prompt: string
}

const MIN_FONT_SIZE = 14
const MAX_FONT_SIZE = 48

const WORD_COLORS = [
  '#3ECF8E',
  '#6EE7B7',
  '#A78BFA',
  '#F472B6',
  '#FCD34D',
  '#60A5FA',
  '#FB923C',
  '#34D399',
]

const getColorForWord = (word: string): string => {
  let hash = 0
  for (let i = 0; i < word.length; i++) {
    hash = word.charCodeAt(i) + ((hash << 5) - hash)
  }
  return WORD_COLORS[Math.abs(hash) % WORD_COLORS.length]
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '24px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '600px',
    width: '100%',
  } as React.CSSProperties,
  prompt: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 16px 0',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
  } as React.CSSProperties,
  input: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  } as React.CSSProperties,
  submitButton: {
    padding: '10px 18px',
    borderRadius: '8px',
    border: 'none',
    background: '#3ECF8E',
    color: '#000',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  } as React.CSSProperties,
  cloud: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px 16px',
    minHeight: '120px',
    padding: '16px',
  } as React.CSSProperties,
  word: (fontSize: number, color: string) =>
    ({
      fontSize: `${fontSize}px`,
      fontWeight: fontSize > 28 ? 700 : 500,
      color,
      lineHeight: 1.2,
      transition: 'font-size 0.3s ease',
    }) as React.CSSProperties,
  emptyState: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center' as const,
    padding: '24px 0',
  } as React.CSSProperties,
  submitted: {
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

export const LiveWordCloud: React.FC<LiveWordCloudProps> = ({
  prompt,
  sessionId,
  serviceUrl,
}) => {
  const { post, get, sessionId: resolvedSessionId } = useLiveApi({ sessionId, serviceUrl })
  const [inputValue, setInputValue] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchWords = useCallback(async (): Promise<WordCloudEntry[] | null> => {
    const response = await get('/wordcloud')
    if (!response || !response.ok) return null
    return response.json()
  }, [get])

  const { data: words } = usePolling(fetchWords)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSubmitting || hasSubmitted) return

    setIsSubmitting(true)
    const response = await post('/wordcloud', { word: inputValue.trim() })

    if (response && (response.ok || response.status === 409)) {
      setHasSubmitted(true)
      setInputValue('')
    }
    setIsSubmitting(false)
  }

  if (!resolvedSessionId) {
    return (
      <div style={styles.container}>
        <p style={styles.noSession}>No live session active</p>
      </div>
    )
  }

  const maxCount = words ? Math.max(...words.map((w) => w.count), 1) : 1

  return (
    <div style={styles.container}>
      <p style={styles.prompt}>{prompt}</p>

      {!hasSubmitted && (
        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            style={styles.input}
            placeholder="Enter a word or short phrase..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            maxLength={50}
          />
          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(isSubmitting || !inputValue.trim() ? styles.submitButtonDisabled : {}),
            }}
            disabled={isSubmitting || !inputValue.trim()}
          >
            Submit
          </button>
        </form>
      )}

      {hasSubmitted && <p style={styles.submitted}>Response submitted</p>}

      <div style={styles.cloud}>
        {(!words || words.length === 0) && (
          <p style={styles.emptyState}>Waiting for responses...</p>
        )}
        {words?.map((entry) => {
          const scale = entry.count / maxCount
          const fontSize = MIN_FONT_SIZE + scale * (MAX_FONT_SIZE - MIN_FONT_SIZE)
          return (
            <span key={entry.word} style={styles.word(fontSize, getColorForWord(entry.word))}>
              {entry.word}
            </span>
          )
        })}
      </div>
    </div>
  )
}
