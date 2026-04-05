'use client'

import React, { useState, useCallback } from 'react'

import { useLiveApi, usePolling } from './use-live-session.js'
import type { LiveComponentProps, QAQuestion } from './types.js'

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
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 16px 0',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
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
  questionList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    maxHeight: '300px',
    overflowY: 'auto' as const,
  } as React.CSSProperties,
  questionItem: (isAnswered: boolean) =>
    ({
      padding: '12px',
      marginBottom: '8px',
      borderRadius: '8px',
      background: isAnswered ? 'rgba(62, 207, 142, 0.1)' : 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${isAnswered ? 'rgba(62, 207, 142, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
    }) as React.CSSProperties,
  questionContent: {
    fontSize: '14px',
    color: '#fff',
    margin: 0,
    lineHeight: 1.4,
  } as React.CSSProperties,
  questionMeta: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: '4px',
  } as React.CSSProperties,
  answeredBadge: {
    display: 'inline-block',
    fontSize: '11px',
    color: '#3ECF8E',
    background: 'rgba(62, 207, 142, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
    marginLeft: '8px',
  } as React.CSSProperties,
  emptyState: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center' as const,
    padding: '24px 0',
  } as React.CSSProperties,
  noSession: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontStyle: 'italic',
  } as React.CSSProperties,
}

export const LiveQA: React.FC<LiveComponentProps> = ({ sessionId, serviceUrl }) => {
  const { post, get, sessionId: resolvedSessionId } = useLiveApi({ sessionId, serviceUrl })
  const [inputValue, setInputValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchQuestions = useCallback(async (): Promise<QAQuestion[] | null> => {
    const response = await get('/questions')
    if (!response || !response.ok) return null
    return response.json()
  }, [get])

  const { data: questions } = usePolling(fetchQuestions)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSubmitting) return

    setIsSubmitting(true)
    const response = await post('/questions', { content: inputValue.trim() })

    if (response && response.ok) {
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

  const sortedQuestions = questions
    ? [...questions].sort((a, b) => {
        if (a.is_answered !== b.is_answered) return a.is_answered ? 1 : -1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    : []

  return (
    <div style={styles.container}>
      <p style={styles.title}>Ask a question</p>

      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          style={styles.input}
          placeholder="Type your question..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          maxLength={500}
        />
        <button
          type="submit"
          style={{
            ...styles.submitButton,
            ...(isSubmitting || !inputValue.trim() ? styles.submitButtonDisabled : {}),
          }}
          disabled={isSubmitting || !inputValue.trim()}
        >
          Send
        </button>
      </form>

      {sortedQuestions.length === 0 ? (
        <p style={styles.emptyState}>No questions yet. Be the first to ask.</p>
      ) : (
        <ul style={styles.questionList}>
          {sortedQuestions.map((q) => (
            <li key={q.id} style={styles.questionItem(q.is_answered)}>
              <p style={styles.questionContent}>
                {q.content}
                {q.is_answered && <span style={styles.answeredBadge}>Answered</span>}
              </p>
              <div style={styles.questionMeta}>
                {q.author_name || 'Anonymous'}
                {' \u00B7 '}
                {new Date(q.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
