import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import { LightTable } from './light-table'
import { SlideContext, type SlideState } from './slide-context'

const clearDOM = () => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }
}

const createSlideDOM = (count: number) => {
  const container = document.createElement('div')
  for (let i = 0; i < count; i++) {
    const slide = document.createElement('section')
    slide.setAttribute('data-slide', '')
    slide.textContent = `Slide ${i + 1} content`
    container.appendChild(slide)
  }
  document.body.appendChild(container)
}

const getTestContext = (overrides?: Partial<SlideState>): SlideState => ({
  currentSlide: 0,
  currentStep: 0,
  totalSlides: 3,
  stepsForCurrentSlide: 0,
  isExiting: false,
  isPresenterMode: false,
  isLightTable: true,
  toggleLightTable: vi.fn(),
  goToSlide: vi.fn(),
  nextStep: vi.fn(),
  previousStep: vi.fn(),
  ...overrides,
})

const renderLightTable = (
  contextOverrides?: Partial<SlideState>,
  props?: { onReorder?: (from: number, to: number) => void },
) => {
  const ctx = getTestContext(contextOverrides)
  return {
    ctx,
    ...render(
      <SlideContext.Provider value={ctx}>
        <LightTable onReorder={props?.onReorder} />
      </SlideContext.Provider>,
    ),
  }
}

describe('LightTable', () => {
  beforeEach(() => {
    clearDOM()
  })

  it('should render a grid of all slides', () => {
    createSlideDOM(4)
    renderLightTable({ totalSlides: 4 })

    expect(screen.getByTestId('light-table')).toBeInTheDocument()
    expect(screen.getByTestId('light-table-slide-0')).toBeInTheDocument()
    expect(screen.getByTestId('light-table-slide-3')).toBeInTheDocument()
  })

  it('should show slide text content', () => {
    createSlideDOM(2)
    renderLightTable({ totalSlides: 2 })

    const table = screen.getByTestId('light-table')
    expect(within(table).getByText('Slide 1 content')).toBeInTheDocument()
    expect(within(table).getByText('Slide 2 content')).toBeInTheDocument()
  })

  it('should highlight a slide on single click without navigating', () => {
    createSlideDOM(3)
    const { ctx } = renderLightTable({ totalSlides: 3 })

    const slide2 = screen.getByTestId('light-table-slide-2')
    fireEvent.click(slide2)

    expect(ctx.goToSlide).not.toHaveBeenCalled()
    expect(ctx.toggleLightTable).not.toHaveBeenCalled()

    const thumbnail = slide2.querySelector('div')
    expect(thumbnail?.style.border).toContain('2px solid')
  })

  it('should navigate and close light table on double click', () => {
    createSlideDOM(3)
    const { ctx } = renderLightTable({ totalSlides: 3 })

    const slide2 = screen.getByTestId('light-table-slide-2')
    fireEvent.doubleClick(slide2)

    expect(ctx.goToSlide).toHaveBeenCalledWith(2)
    expect(ctx.toggleLightTable).toHaveBeenCalled()
  })

  it('should navigate and close light table when pressing Enter on a focused slide', () => {
    createSlideDOM(3)
    const { ctx } = renderLightTable({ totalSlides: 3 })

    const slide1 = screen.getByTestId('light-table-slide-1')
    fireEvent.keyDown(slide1, { key: 'Enter' })

    expect(ctx.goToSlide).toHaveBeenCalledWith(1)
    expect(ctx.toggleLightTable).toHaveBeenCalled()
  })

  it('should highlight current slide', () => {
    createSlideDOM(3)
    renderLightTable({ currentSlide: 1, totalSlides: 3 })

    const activeSlide = screen.getByTestId('light-table-slide-1')
    const thumbnail = activeSlide.querySelector('div')
    expect(thumbnail?.style.border).toContain('2px solid')
  })

  it('should support drag and drop reordering', () => {
    createSlideDOM(3)
    const onReorder = vi.fn()
    renderLightTable({ totalSlides: 3 }, { onReorder })

    const slide0 = screen.getByTestId('light-table-slide-0')
    const slide2 = screen.getByTestId('light-table-slide-2')

    fireEvent.dragStart(slide0)
    fireEvent.dragOver(slide2)
    fireEvent.drop(slide2)

    expect(onReorder).toHaveBeenCalledWith(0, 2)
  })

  it('should not reorder when dropping on same position', () => {
    createSlideDOM(3)
    const onReorder = vi.fn()
    renderLightTable({ totalSlides: 3 }, { onReorder })

    const slide1 = screen.getByTestId('light-table-slide-1')

    fireEvent.dragStart(slide1)
    fireEvent.dragOver(slide1)
    fireEvent.drop(slide1)

    expect(onReorder).not.toHaveBeenCalled()
  })
})
