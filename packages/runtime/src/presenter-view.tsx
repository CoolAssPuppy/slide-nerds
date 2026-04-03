'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useSlideState } from './slide-context'
import { getNotesForSlide } from './slide-dom'

type PresenterViewProps = {
  className?: string
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export const PresenterView: React.FC<PresenterViewProps> = ({ className }) => {
  const { currentSlide, currentStep, totalSlides, stepsForCurrentSlide } = useSlideState()
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const notes = useMemo(() => getNotesForSlide(currentSlide), [currentSlide])

  return (
    <div
      className={className}
      data-testid="presenter-view"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0a0a0c',
        color: '#e8e6e3',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem',
        gap: '1.5rem',
        zIndex: 10000,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
          <span data-testid="slide-counter" style={{ fontSize: '2rem', fontWeight: 700 }}>
            {currentSlide + 1}
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}> / {totalSlides}</span>
          </span>
          {stepsForCurrentSlide > 0 && (
            <span data-testid="step-counter" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
              Step {currentStep} of {stepsForCurrentSlide}
            </span>
          )}
        </div>
        <span data-testid="timer" style={{
          fontSize: '1.5rem',
          fontVariantNumeric: 'tabular-nums',
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 500,
        }}>
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '1rem',
        }}>
          Speaker notes
        </div>
        <div data-testid="speaker-notes" style={{
          fontSize: '1.35rem',
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.85)',
          maxWidth: '720px',
        }}>
          {notes.length > 0 ? (
            notes.map((note, i) => <p key={i} style={{ marginBottom: '1rem' }}>{note}</p>)
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
              No speaker notes for this slide.
            </p>
          )}
        </div>
      </div>

      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingTop: '1rem',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.25)',
      }}>
        Navigate from the main window. Notes sync automatically.
      </div>
    </div>
  )
}
