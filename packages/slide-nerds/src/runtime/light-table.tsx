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

const ACCENT_COLOR = 'var(--color-accent, #f59e0b)'

const getBorder = (isActive: boolean, isSelected: boolean): string => {
  if (isActive) return `2px solid ${ACCENT_COLOR}`
  if (isSelected) return `2px solid rgba(255,255,255,0.85)`
  return '1px solid rgba(255,255,255,0.1)'
}

const SlideThumbnail: React.FC<{
  slideIndex: number
  isActive: boolean
  isSelected: boolean
}> = ({ slideIndex, isActive, isSelected }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const slideEl = getSlideElements()[slideIndex]
    if (!slideEl) return

    const clone = slideEl.cloneNode(true) as HTMLElement
    clone.classList.add('active')
    clone.classList.remove('exiting', 'entering')
    clone.style.cssText = CLONE_STYLE

    clone.querySelectorAll('[data-notes]').forEach((note) => {
      ;(note as HTMLElement).style.display = 'none'
    })

    clone
      .querySelectorAll('[data-step], [data-auto-step], [data-exit-step]')
      .forEach((step) => {
        step.classList.add('step-visible')
        step.classList.remove('exit-visible')
      })

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
        border: getBorder(isActive, isSelected),
        transition: 'border-color 150ms ease, box-shadow 150ms ease',
        boxShadow: isSelected && !isActive ? '0 0 0 4px rgba(255,255,255,0.08)' : 'none',
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
      <div
        style={{
          padding: '0.5rem 0.75rem',
          background: 'rgba(255,255,255,0.03)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: isActive ? ACCENT_COLOR : 'rgba(255,255,255,0.35)',
          letterSpacing: '0.05em',
        }}
      >
        Slide {slideIndex + 1}
      </div>
    </div>
  )
}

export const LightTable: React.FC<LightTableProps> = ({ className, onReorder }) => {
  const { currentSlide, goToSlide, toggleLightTable } = useSlideState()
  const [dragSource, setDragSource] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const slides = useMemo(() => getSlidesInfo(), [])

  useEffect(() => {
    setSelectedIndex(currentSlide)
  }, [currentSlide])

  const handleSlideClick = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  const handleSlideDoubleClick = useCallback(
    (index: number) => {
      goToSlide(index)
      toggleLightTable()
    },
    [goToSlide, toggleLightTable],
  )

  const handleSlideKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        goToSlide(index)
        toggleLightTable()
      }
    },
    [goToSlide, toggleLightTable],
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
          tabIndex={0}
          data-testid={`light-table-slide-${slide.index}`}
          draggable
          onClick={() => handleSlideClick(slide.index)}
          onDoubleClick={() => handleSlideDoubleClick(slide.index)}
          onKeyDown={(event) => handleSlideKeyDown(event, slide.index)}
          onDragStart={() => handleDragStart(slide.index)}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(slide.index)}
          onDragEnd={handleDragEnd}
          style={{
            opacity: dragSource === slide.index ? 0.5 : 1,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <SlideThumbnail
            slideIndex={slide.index}
            isActive={slide.index === currentSlide}
            isSelected={slide.index === selectedIndex}
          />
        </div>
      ))}
    </div>
  )
}
