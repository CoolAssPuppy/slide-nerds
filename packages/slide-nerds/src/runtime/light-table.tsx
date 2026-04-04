'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSlideState } from './slide-context'
import { getSlideElements, getSlidesInfo } from './slide-dom'

type LightTableProps = {
  className?: string
  onReorder?: (fromIndex: number, toIndex: number) => void
}

const THUMB_WIDTH = 280
const THUMB_HEIGHT = Math.round(THUMB_WIDTH * (9 / 16))
const SCALE = THUMB_WIDTH / 1920

const SlideThumbnail: React.FC<{
  slideIndex: number
  isActive: boolean
}> = ({ slideIndex, isActive }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const slideEl = getSlideElements()[slideIndex]
    if (!slideEl) return

    const clone = slideEl.cloneNode(true) as HTMLElement
    clone.classList.add('active')
    clone.style.position = 'absolute'
    clone.style.top = '0'
    clone.style.left = '0'
    clone.style.width = '1920px'
    clone.style.height = '1080px'
    clone.style.transform = `scale(${SCALE})`
    clone.style.transformOrigin = 'top left'
    clone.style.pointerEvents = 'none'
    clone.style.display = 'flex'

    clone.querySelectorAll('[data-step]').forEach((step) => {
      const el = step as HTMLElement
      el.style.visibility = 'visible'
      el.style.opacity = '1'
      el.style.transform = 'none'
    })

    clone.querySelectorAll('[data-notes]').forEach((note) => {
      (note as HTMLElement).style.display = 'none'
    })

    // Clear existing children safely
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
    container.appendChild(clone)
  }, [slideIndex])

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

  const slides = useMemo(() => getSlidesInfo(), [])

  const handleSlideClick = useCallback(
    (index: number) => {
      goToSlide(index)
    },
    [goToSlide],
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
          />
        </div>
      ))}
    </div>
  )
}
