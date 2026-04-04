import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSlideNavigation } from './use-slide-navigation'

const clearDOM = () => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }
}

const createSlideDOM = (slideCount: number, stepsPerSlide: number[] = []) => {
  clearDOM()
  const container = document.createElement('div')

  for (let i = 0; i < slideCount; i++) {
    const slide = document.createElement('section')
    slide.setAttribute('data-slide', '')
    slide.textContent = `Slide ${i + 1}`

    const stepCount = stepsPerSlide[i] ?? 0
    for (let s = 0; s < stepCount; s++) {
      const step = document.createElement('div')
      step.setAttribute('data-step', '')
      step.textContent = `Step ${s + 1}`
      step.style.visibility = 'hidden'
      step.style.opacity = '0'
      slide.appendChild(step)
    }

    container.appendChild(slide)
  }

  document.body.appendChild(container)
}

describe('useSlideNavigation', () => {
  beforeEach(() => {
    clearDOM()
    window.history.replaceState({}, '', '/')
  })

  it('should start at slide 0 with no URL param', () => {
    createSlideDOM(3)
    const { result } = renderHook(() => useSlideNavigation())

    expect(result.current.currentSlide).toBe(0)
    expect(result.current.currentStep).toBe(0)
    expect(result.current.totalSlides).toBe(3)
  })

  it('should parse initial slide from URL', () => {
    window.history.replaceState({}, '', '/?slide=2')
    createSlideDOM(3)
    const { result } = renderHook(() => useSlideNavigation())

    expect(result.current.currentSlide).toBe(1)
  })

  it('should navigate to a specific slide', () => {
    createSlideDOM(5)
    const { result } = renderHook(() => useSlideNavigation())

    act(() => {
      result.current.goToSlide(3)
    })

    expect(result.current.currentSlide).toBe(3)
    expect(result.current.currentStep).toBe(0)
  })

  it('should clamp slide index to valid range', () => {
    createSlideDOM(3)
    const { result } = renderHook(() => useSlideNavigation())

    act(() => {
      result.current.goToSlide(10)
    })

    expect(result.current.currentSlide).toBe(2)

    act(() => {
      result.current.goToSlide(-1)
    })

    expect(result.current.currentSlide).toBe(0)
  })

  it('should advance to next slide when no steps remain', () => {
    createSlideDOM(3)
    const { result } = renderHook(() => useSlideNavigation())

    act(() => {
      result.current.nextStep()
    })

    expect(result.current.currentSlide).toBe(1)
  })

  it('should reveal steps before advancing to next slide', () => {
    createSlideDOM(3, [2, 0, 0])
    const { result } = renderHook(() => useSlideNavigation())

    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentSlide).toBe(0)
    expect(result.current.currentStep).toBe(1)

    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentSlide).toBe(0)
    expect(result.current.currentStep).toBe(2)

    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentSlide).toBe(1)
    expect(result.current.currentStep).toBe(0)
  })

  it('should go back to previous step', () => {
    createSlideDOM(3, [2, 0, 0])
    const { result } = renderHook(() => useSlideNavigation())

    act(() => {
      result.current.nextStep()
    })
    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentStep).toBe(2)

    act(() => {
      result.current.previousStep()
    })
    expect(result.current.currentStep).toBe(1)
  })

  it('should go to previous slide when at step 0', () => {
    createSlideDOM(3)
    const { result } = renderHook(() => useSlideNavigation())

    act(() => {
      result.current.goToSlide(2)
    })

    act(() => {
      result.current.previousStep()
    })

    expect(result.current.currentSlide).toBe(1)
  })

  it('should not go before slide 0', () => {
    createSlideDOM(3)
    const { result } = renderHook(() => useSlideNavigation())

    act(() => {
      result.current.previousStep()
    })

    expect(result.current.currentSlide).toBe(0)
  })

  it('should sync slide to URL', () => {
    createSlideDOM(3)
    const { result } = renderHook(() => useSlideNavigation())

    act(() => {
      result.current.goToSlide(2)
    })

    const params = new URLSearchParams(window.location.search)
    expect(params.get('slide')).toBe('3')
  })

  it('should report steps for current slide', () => {
    createSlideDOM(3, [3, 1, 0])
    const { result } = renderHook(() => useSlideNavigation())

    expect(result.current.stepsForCurrentSlide).toBe(3)
  })

  it('should animate matching magic move elements without FLIP measurements', () => {
    clearDOM()
    const container = document.createElement('div')

    const slideOne = document.createElement('section')
    slideOne.setAttribute('data-slide', '')
    const source = document.createElement('div')
    source.setAttribute('data-magic-id', 'metric')
    source.textContent = 'Revenue'
    slideOne.appendChild(source)

    const slideTwo = document.createElement('section')
    slideTwo.setAttribute('data-slide', '')
    const target = document.createElement('div')
    target.setAttribute('data-magic-id', 'metric')
    target.textContent = 'Revenue'
    slideTwo.appendChild(target)

    container.append(slideOne, slideTwo)
    document.body.appendChild(container)

    const rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect')
    const { result } = renderHook(() => useSlideNavigation())

    act(() => {
      result.current.goToSlide(1)
    })

    expect(rectSpy).not.toHaveBeenCalled()
    rectSpy.mockRestore()
  })
})
