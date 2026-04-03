import { useCallback, useEffect, useRef, useState } from 'react'

type SlideNavigationState = {
  currentSlide: number
  currentStep: number
  totalSlides: number
  stepsForCurrentSlide: number
  goToSlide: (index: number) => void
  nextStep: () => void
  previousStep: () => void
}

const getSlideElements = (): NodeListOf<Element> => {
  return document.querySelectorAll('[data-slide]')
}

const getStepElements = (slideIndex: number): NodeListOf<Element> => {
  const slides = getSlideElements()
  const slide = slides[slideIndex]
  if (!slide) return document.querySelectorAll('.nonexistent')
  return slide.querySelectorAll('[data-step]')
}

const parseSlideFromUrl = (): number => {
  if (typeof window === 'undefined') return 0
  const params = new URLSearchParams(window.location.search)
  const slide = params.get('slide')
  if (!slide) return 0
  const parsed = parseInt(slide, 10)
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed - 1)
}

const syncUrlToSlide = (slideIndex: number): void => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('slide', String(slideIndex + 1))
  window.history.replaceState({}, '', url.toString())
}

const applyStepVisibility = (slideIndex: number, visibleSteps: number): void => {
  const steps = getStepElements(slideIndex)
  steps.forEach((step, index) => {
    const el = step as HTMLElement
    el.style.visibility = index < visibleSteps ? 'visible' : 'hidden'
    el.style.opacity = index < visibleSteps ? '1' : '0'
  })
}

export const useSlideNavigation = (): SlideNavigationState => {
  const [currentSlide, setCurrentSlide] = useState(parseSlideFromUrl)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSlides, setTotalSlides] = useState(0)
  const [stepsForCurrentSlide, setStepsForCurrentSlide] = useState(0)
  const slideCountRef = useRef(0)

  useEffect(() => {
    const count = getSlideElements().length
    slideCountRef.current = count
    setTotalSlides(count)
  }, [])

  useEffect(() => {
    setStepsForCurrentSlide(getStepElements(currentSlide).length)
  }, [currentSlide])

  const goToSlide = useCallback(
    (index: number) => {
      const total = slideCountRef.current || getSlideElements().length
      const clamped = Math.max(0, Math.min(index, total - 1))
      setCurrentSlide(clamped)
      setCurrentStep(0)
      syncUrlToSlide(clamped)
    },
    [],
  )

  const nextStep = useCallback(() => {
    const totalSteps = getStepElements(currentSlide).length

    if (currentStep < totalSteps) {
      const next = currentStep + 1
      setCurrentStep(next)
      applyStepVisibility(currentSlide, next)
    } else {
      const total = slideCountRef.current || getSlideElements().length
      if (currentSlide < total - 1) {
        goToSlide(currentSlide + 1)
      }
    }
  }, [currentSlide, currentStep, goToSlide])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      const prev = currentStep - 1
      setCurrentStep(prev)
      applyStepVisibility(currentSlide, prev)
    } else if (currentSlide > 0) {
      goToSlide(currentSlide - 1)
    }
  }, [currentSlide, currentStep, goToSlide])

  useEffect(() => {
    applyStepVisibility(currentSlide, currentStep)
  }, [currentSlide, currentStep])

  useEffect(() => {
    syncUrlToSlide(currentSlide)
  }, [currentSlide])

  return {
    currentSlide,
    currentStep,
    totalSlides,
    stepsForCurrentSlide,
    goToSlide,
    nextStep,
    previousStep,
  }
}
