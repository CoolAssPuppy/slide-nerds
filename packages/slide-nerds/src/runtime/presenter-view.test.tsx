import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, act } from '@testing-library/react'
import { PresenterView } from './presenter-view'
import { SlideContext, type SlideState } from './slide-context'

const clearDOM = () => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }
}

const createSlideWithNotes = () => {
  const container = document.createElement('div')
  container.setAttribute('id', 'slide-container')

  const slide1 = document.createElement('section')
  slide1.setAttribute('data-slide', '')
  const note1 = document.createElement('div')
  note1.setAttribute('data-notes', '')
  note1.textContent = 'Remember to pause here.'
  slide1.appendChild(note1)

  const slide2 = document.createElement('section')
  slide2.setAttribute('data-slide', '')

  container.appendChild(slide1)
  container.appendChild(slide2)
  document.body.appendChild(container)
}

const getTestContext = (overrides?: Partial<SlideState>): SlideState => ({
  currentSlide: 0,
  currentStep: 0,
  totalSlides: 5,
  stepsForCurrentSlide: 0,
  isExiting: false,
  isPresenterMode: true,
  isLightTable: false,
  toggleLightTable: vi.fn(),
  goToSlide: vi.fn(),
  nextStep: vi.fn(),
  previousStep: vi.fn(),
  ...overrides,
})

const renderPresenter = (contextOverrides?: Partial<SlideState>) => {
  const ctx = getTestContext(contextOverrides)
  return render(
    <SlideContext.Provider value={ctx}>
      <PresenterView />
    </SlideContext.Provider>,
  )
}

describe('PresenterView', () => {
  beforeEach(() => {
    clearDOM()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should display slide counter', () => {
    createSlideWithNotes()
    renderPresenter({ currentSlide: 2, totalSlides: 10 })
    expect(screen.getByTestId('slide-counter').textContent).toBe('3 / 10')
  })

  it('should display step counter', () => {
    createSlideWithNotes()
    renderPresenter({ currentStep: 3, stepsForCurrentSlide: 5 })
    expect(screen.getByTestId('step-counter').textContent).toBe('Step 3 of 5')
  })

  it('should display running timer', () => {
    createSlideWithNotes()
    renderPresenter()

    expect(screen.getByTestId('timer').textContent).toBe('00:00')

    act(() => {
      vi.advanceTimersByTime(65000)
    })

    expect(screen.getByTestId('timer').textContent).toBe('01:05')
  })

  it('should display speaker notes for the current slide', () => {
    createSlideWithNotes()
    renderPresenter({ currentSlide: 0 })
    const notesSection = screen.getByTestId('speaker-notes')
    expect(within(notesSection).getByText('Remember to pause here.')).toBeInTheDocument()
  })

  it('should show placeholder when no notes exist', () => {
    createSlideWithNotes()
    renderPresenter({ currentSlide: 1 })
    expect(screen.getByText('No speaker notes for this slide.')).toBeInTheDocument()
  })
})
