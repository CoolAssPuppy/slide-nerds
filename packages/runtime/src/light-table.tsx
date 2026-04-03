import React, { useCallback, useMemo, useState } from 'react'
import { useSlideState } from './slide-context'
import { getSlidesInfo } from './slide-dom'

type LightTableProps = {
  className?: string
  onReorder?: (fromIndex: number, toIndex: number) => void
}

export const LightTable: React.FC<LightTableProps> = ({ className, onReorder }) => {
  const { currentSlide, goToSlide } = useSlideState()
  const [dragSource, setDragSource] = useState<number | null>(null)
  const [dragTarget, setDragTarget] = useState<number | null>(null)

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

  const handleDragOver = useCallback((event: React.DragEvent, index: number) => {
    event.preventDefault()
    setDragTarget(index)
  }, [])

  const handleDrop = useCallback(
    (index: number) => {
      if (dragSource !== null && dragSource !== index) {
        onReorder?.(dragSource, index)
      }
      setDragSource(null)
      setDragTarget(null)
    },
    [dragSource, onReorder],
  )

  const handleDragEnd = useCallback(() => {
    setDragSource(null)
    setDragTarget(null)
  }, [])

  return (
    <div
      className={className}
      data-testid="light-table"
      role="grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        padding: '1rem',
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
          onDragOver={(e) => handleDragOver(e, slide.index)}
          onDrop={() => handleDrop(slide.index)}
          onDragEnd={handleDragEnd}
          style={{
            border: slide.index === currentSlide ? '2px solid #e94560' : '1px solid #ccc',
            padding: '0.5rem',
            cursor: 'pointer',
            opacity: dragSource === slide.index ? 0.5 : 1,
            background: dragTarget === slide.index ? '#f0f0f0' : 'transparent',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#666' }}>Slide {slide.index + 1}</div>
          <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {slide.textContent || 'Empty slide'}
          </div>
        </div>
      ))}
    </div>
  )
}
