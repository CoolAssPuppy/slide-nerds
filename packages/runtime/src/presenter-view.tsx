import React, { useEffect, useState } from 'react'
import { useSlideState } from './slide-context'

type PresenterViewProps = {
  className?: string
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

const getNotesForSlide = (slideIndex: number): string[] => {
  if (typeof document === 'undefined') return []
  const slides = document.querySelectorAll('[data-slide]')
  const slide = slides[slideIndex]
  if (!slide) return []
  const noteElements = slide.querySelectorAll('[data-notes]')
  return Array.from(noteElements).map((el) => el.textContent ?? '')
}

export const PresenterView: React.FC<PresenterViewProps> = ({ className }) => {
  const { currentSlide, currentStep, totalSlides } = useSlideState()
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const notes = getNotesForSlide(currentSlide)

  return (
    <div className={className} data-testid="presenter-view">
      <div data-testid="slide-counter">
        {currentSlide + 1} / {totalSlides}
      </div>
      <div data-testid="step-counter">Step: {currentStep}</div>
      <div data-testid="timer">{formatTime(elapsedSeconds)}</div>
      <div data-testid="speaker-notes">
        {notes.length > 0 ? (
          notes.map((note, i) => <p key={i}>{note}</p>)
        ) : (
          <p>No speaker notes for this slide.</p>
        )}
      </div>
    </div>
  )
}
