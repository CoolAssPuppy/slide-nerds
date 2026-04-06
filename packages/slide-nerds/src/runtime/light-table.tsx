'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSlideState } from './slide-context.js'
import { getSlideElements, getSlidesInfo } from './slide-dom.js'

type LightTableProps = {
  className?: string
  onReorder?: (fromIndex: number, toIndex: number) => void
}

const THUMB_WIDTH = 280
const THUMB_HEIGHT = Math.round(THUMB_WIDTH * (9 / 16))
const SCALE = THUMB_WIDTH / 1920

const CLONE_STYLE = [
  'position: absolute',
  'inset: auto',
  'top: 0',
  'left: 0',
  'right: auto',
  'bottom: auto',
  'width: 1920px',
  'height: 1080px',
  `transform: scale(${SCALE})`,
  'transform-origin: top left',
  'pointer-events: none',
  'display: flex',
  'overflow: hidden',
].join('; ')

const SlideThumbnail: React.FC<{
  slideIndex: number
  isActive: boolean
  isPreviewing: boolean
}> = ({ slideIndex, isActive, isPreviewing }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const cloneRef = useRef<HTMLElement | null>(null)
  const stepsRef = useRef<NodeListOf<Element> | null>(null)
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clone once on mount
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const slideEl = getSlideElements()[slideIndex]
    if (!slideEl) return

    const clone = slideEl.cloneNode(true) as HTMLElement
    clone.classList.add('active')
    clone.style.cssText = CLONE_STYLE

    clone.querySelectorAll('[data-notes]').forEach((note) => {
      (note as HTMLElement).style.display = 'none'
    })

    const steps = clone.querySelectorAll('[data-step], [data-auto-step]')
    steps.forEach((step) => step.classList.add('step-visible'))

    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
    container.appendChild(clone)

    cloneRef.current = clone
    stepsRef.current = steps

    return () => {
      cloneRef.current = null
      stepsRef.current = null
    }
  }, [slideIndex])

  // Handle preview animation separately
  useEffect(() => {
    const steps = stepsRef.current
    if (!steps || steps.length === 0) return

    if (animTimerRef.current !== null) {
      clearTimeout(animTimerRef.current)
      animTimerRef.current = null
    }

    if (isPreviewing) {
      steps.forEach((step) => step.classList.remove('step-visible'))

      let stepIndex = 0
      const revealNext = () => {
        if (stepIndex >= steps.length) return
        steps[stepIndex].classList.add('step-visible')
        stepIndex++
        animTimerRef.current = setTimeout(revealNext, 400)
      }
      animTimerRef.current = setTimeout(revealNext, 300)
    } else {
      steps.forEach((step) => step.classList.add('step-visible'))
    }

    return () => {
      if (animTimerRef.current !== null) {
        clearTimeout(animTimerRef.current)
        animTimerRef.current = null
      }
    }
  }, [isPreviewing])

  return (
    <div
      style={{
        borderRadius: '8px',
        overflow: 'hidden',
        border: isActive ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
        transition: 'border-color 150ms ease',
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: THUMB_WIDTH,
          height: THUMB_HEIGHT,
          position: 'relative',
          overflow: 'hidden',
          background: '#111114',
        }}
      />
      <div style={{
        padding: '0.5rem 0.75rem',
        background: 'rgba(255,255,255,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        fontSize: '0.7rem',
        fontWeight: 600,
        color: isActive ? '#f59e0b' : 'rgba(255,255,255,0.35)',
        letterSpacing: '0.05em',
      }}>
        Slide {slideIndex + 1}
      </div>
    </div>
  )
}

export const LightTable: React.FC<LightTableProps> = ({ className, onReorder }) => {
  const { currentSlide, goToSlide } = useSlideState()
  const [dragSource, setDragSource] = useState<number | null>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  const slides = useMemo(() => getSlidesInfo(), [])

  const handleSlideClick = useCallback(
    (index: number) => {
      if (previewIndex === index) {
        goToSlide(index)
        setPreviewIndex(null)
      } else {
        setPreviewIndex(index)
      }
    },
    [goToSlide, previewIndex],
  )

  const handleDragStart = useCallback((index: number) => {
    setDragSource(index)
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (index: number) => {
      if (dragSource !== null && dragSource !== index) {
        onReorder?.(dragSource, index)
      }
      setDragSource(null)
    },
    [dragSource, onReorder],
  )

  const handleDragEnd = useCallback(() => {
    setDragSource(null)
  }, [])

  return (
    <div
      className={className}
      data-testid="light-table"
      role="grid"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${THUMB_WIDTH}px)`,
        gap: '1.25rem',
        padding: '2rem',
        overflowY: 'auto',
        alignContent: 'start',
        justifyContent: 'center',
      }}
    >
      {slides.map((slide) => (
        <div
          key={slide.index}
          role="gridcell"
          data-testid={`light-table-slide-${slide.index}`}
          draggable
          onClick={() => handleSlideClick(slide.index)}
          onDragStart={() => handleDragStart(slide.index)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(slide.index)}
          onDragEnd={handleDragEnd}
          style={{
            opacity: dragSource === slide.index ? 0.5 : 1,
            cursor: 'pointer',
          }}
        >
          <SlideThumbnail
            slideIndex={slide.index}
            isActive={slide.index === currentSlide}
            isPreviewing={previewIndex === slide.index}
          />
        </div>
      ))}
    </div>
  )
}
