'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getSlideElements,
  getExitStepElements,
  getStepEntries,
  hasExitAnimations,
} from './slide-dom'

const EXIT_ANIMATION_DURATION = 400

type SlideNavigationState = {
  currentSlide: number
  currentStep: number
  totalSlides: number
  stepsForCurrentSlide: number
  isExiting: boolean
  goToSlide: (index: number) => void
  nextStep: () => void
  previousStep: () => void
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

const applyStepVisibility = (
  slideIndex: number,
  visibleSteps: number,
): void => {
  const entries = getStepEntries(slideIndex)
  let entryIndex = 0

  for (const entry of entries) {
    const isVisible = entryIndex < visibleSteps
    for (const el of entry.elements) {
      if (isVisible) {
        el.classList.add('step-visible')
      } else {
        el.classList.remove('step-visible')
      }
    }
    entryIndex++
  }
}

const applyExitStepVisibility = (
  slideIndex: number,
  visibleExitSteps: number,
): void => {
  const exitSteps = getExitStepElements(slideIndex)
  exitSteps.forEach((step, index) => {
    if (index < visibleExitSteps) {
      step.classList.add('exit-visible')
    } else {
      step.classList.remove('exit-visible')
    }
  })
}

const getLogicalStepCount = (slideIndex: number): number => {
  return getStepEntries(slideIndex).length
}

export const useSlideNavigation = (): SlideNavigationState => {
  const [currentSlide, setCurrentSlide] = useState(parseSlideFromUrl)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSlides, setTotalSlides] = useState(0)
  const [stepsForCurrentSlide, setStepsForCurrentSlide] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const totalSlidesRef = useRef(0)
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoStepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentExitStep = useRef(0)

  useEffect(() => {
    const count = getSlideElements().length
    totalSlidesRef.current = count
    setTotalSlides(count)
  }, [])

  useEffect(() => {
    setStepsForCurrentSlide(getLogicalStepCount(currentSlide))
  }, [currentSlide])

  const clearAutoStepTimer = useCallback(() => {
    if (autoStepTimeoutRef.current !== null) {
      clearTimeout(autoStepTimeoutRef.current)
      autoStepTimeoutRef.current = null
    }
  }, [])

  const performSlideTransition = useCallback(
    (targetSlide: number) => {
      const slides = getSlideElements()
      const prevSlide = currentSlide
      const prevEl = slides[prevSlide]
      const nextEl = slides[targetSlide]

      const previousMagicIds = new Set<string>()
      if (prevEl) {
        prevEl.querySelectorAll('[data-magic-id]').forEach((el) => {
          const id = el.getAttribute('data-magic-id')
          if (id) previousMagicIds.add(id)
        })
      }

      slides.forEach((slide, index) => {
        if (index === targetSlide) {
          slide.classList.add('active')
        } else {
          slide.classList.remove('active')
          slide.classList.remove('exiting')
        }
      })

      if (nextEl && previousMagicIds.size > 0) {
        nextEl.querySelectorAll('[data-magic-id]').forEach((el) => {
          const id = el.getAttribute('data-magic-id')
          if (!id) return
          if (!previousMagicIds.has(id)) return
          const htmlEl = el as HTMLElement
          htmlEl.style.transition = 'none'
          htmlEl.style.opacity = '0'
          htmlEl.style.transform = 'scale(0.96)'
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              htmlEl.style.transition =
                'opacity 420ms cubic-bezier(0.4, 0, 0.2, 1), transform 420ms cubic-bezier(0.4, 0, 0.2, 1)'
              htmlEl.style.opacity = '1'
              htmlEl.style.transform = 'scale(1)'
              const cleanup = () => {
                htmlEl.style.transition = ''
                htmlEl.style.opacity = ''
                htmlEl.style.transform = ''
                htmlEl.removeEventListener('transitionend', cleanup)
              }
              htmlEl.addEventListener('transitionend', cleanup)
            })
          })
        })
      }

      setCurrentSlide(targetSlide)
      setCurrentStep(0)
      setIsExiting(false)
      currentExitStep.current = 0
    },
    [currentSlide],
  )

  const startExitTransition = useCallback(
    (targetSlide: number) => {
      const slides = getSlideElements()
      const currentEl = slides[currentSlide]

      if (!currentEl || !hasExitAnimations(currentSlide)) {
        performSlideTransition(targetSlide)
        return
      }

      setIsExiting(true)
      currentEl.classList.add('exiting')

      if (exitTimeoutRef.current !== null) {
        clearTimeout(exitTimeoutRef.current)
      }

      exitTimeoutRef.current = setTimeout(() => {
        performSlideTransition(targetSlide)
        exitTimeoutRef.current = null
      }, EXIT_ANIMATION_DURATION)
    },
    [currentSlide, performSlideTransition],
  )

  const goToSlide = useCallback(
    (index: number) => {
      const total = totalSlidesRef.current
      if (total === 0) return
      const clamped = Math.max(0, Math.min(index, total - 1))
      if (clamped === currentSlide) return
      clearAutoStepTimer()
      startExitTransition(clamped)
    },
    [currentSlide, startExitTransition, clearAutoStepTimer],
  )

  const nextStep = useCallback(() => {
    if (isExiting) return

    const logicalSteps = getLogicalStepCount(currentSlide)
    const exitSteps = getExitStepElements(currentSlide).length

    if (currentStep < logicalSteps) {
      setCurrentStep(currentStep + 1)
    } else if (exitSteps > 0 && currentExitStep.current < exitSteps) {
      currentExitStep.current++
      applyExitStepVisibility(currentSlide, currentExitStep.current)
      if (currentExitStep.current >= exitSteps && currentSlide < totalSlidesRef.current - 1) {
        startExitTransition(currentSlide + 1)
      }
    } else if (currentSlide < totalSlidesRef.current - 1) {
      clearAutoStepTimer()
      startExitTransition(currentSlide + 1)
    }
  }, [currentSlide, currentStep, isExiting, startExitTransition, clearAutoStepTimer])

  const previousStep = useCallback(() => {
    if (isExiting) return

    if (currentExitStep.current > 0) {
      currentExitStep.current--
      applyExitStepVisibility(currentSlide, currentExitStep.current)
    } else if (currentStep > 0) {
      clearAutoStepTimer()
      setCurrentStep(currentStep - 1)
    } else if (currentSlide > 0) {
      clearAutoStepTimer()
      startExitTransition(currentSlide - 1)
    }
  }, [currentSlide, currentStep, isExiting, startExitTransition, clearAutoStepTimer])

  // Auto-step sequencing: when a slide becomes active, auto-advance through auto-steps
  useEffect(() => {
    clearAutoStepTimer()

    const entries = getStepEntries(currentSlide)
    if (entries.length === 0) return

    const scheduleAutoStep = (stepIndex: number) => {
      if (stepIndex >= entries.length) return
      const entry = entries[stepIndex]
      if (!entry.isAuto) return

      autoStepTimeoutRef.current = setTimeout(() => {
        setCurrentStep((prev) => {
          const next = prev + 1
          scheduleAutoStep(next)
          return next
        })
      }, entry.autoDelay)
    }

    // Start auto-stepping from current position
    if (currentStep < entries.length && entries[currentStep]?.isAuto) {
      scheduleAutoStep(currentStep)
    }

    return () => clearAutoStepTimer()
  }, [currentSlide, clearAutoStepTimer]) // Only re-run on slide change, not step change

  // Apply step visibility
  useEffect(() => {
    applyStepVisibility(currentSlide, currentStep)
  }, [currentSlide, currentStep])

  // Sync active class on initial render and slide changes
  const prevSlideRef = useRef<number>(-1)

  useEffect(() => {
    if (prevSlideRef.current === currentSlide) return

    const slides = getSlideElements()
    slides.forEach((slide, index) => {
      if (index === currentSlide) {
        slide.classList.add('active')
      } else {
        slide.classList.remove('active')
        slide.classList.remove('exiting')
      }
    })

    prevSlideRef.current = currentSlide
  }, [currentSlide])

  useEffect(() => {
    syncUrlToSlide(currentSlide)
  }, [currentSlide])

  return {
    currentSlide,
    currentStep,
    totalSlides,
    stepsForCurrentSlide,
    isExiting,
    goToSlide,
    nextStep,
    previousStep,
  }
}
