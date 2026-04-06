'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getSlideElements,
  getExitStepElements,
  getStepEntries,
  hasExitAnimations,
} from './slide-dom.js'

const EXIT_ANIMATION_DURATION = 400
const MAGIC_MOVE_DURATION = 420
const SLIDE_TRANSITION_DURATION = 560

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

const toggleClassByThreshold = (
  elements: ArrayLike<Element>,
  visibleCount: number,
  className: string,
): void => {
  for (let i = 0; i < elements.length; i++) {
    elements[i].classList.toggle(className, i < visibleCount)
  }
}

const applyStepVisibility = (slideIndex: number, visibleSteps: number): void => {
  const entries = getStepEntries(slideIndex)
  for (const [i, entry] of entries.entries()) {
    const isVisible = i < visibleSteps
    for (const el of entry.elements) {
      el.classList.toggle('step-visible', isVisible)
    }
  }
}

const setActiveSlide = (slides: NodeListOf<Element>, targetIndex: number): void => {
  slides.forEach((slide, index) => {
    slide.classList.toggle('active', index === targetIndex)
    if (index !== targetIndex) {
      slide.classList.remove('exiting')
      slide.classList.remove('entering')
    }
  })
}

const getTransitionName = (
  currentSlide: Element | undefined,
  targetSlide: Element | undefined,
): string => {
  const candidate =
    targetSlide?.getAttribute('data-transition') ??
    currentSlide?.getAttribute('data-transition') ??
    'fade'
  return candidate.trim() || 'fade'
}

const applySlideTransitionClasses = (
  currentSlide: Element,
  targetSlide: Element,
  transitionName: string,
): ReturnType<typeof setTimeout> => {
  const transitionClass = `transition-${transitionName}`
  currentSlide.classList.add('active', 'exiting', transitionClass)
  targetSlide.classList.add('active', 'entering', transitionClass)

  return setTimeout(() => {
    currentSlide.classList.remove('active', 'exiting', transitionClass)
    targetSlide.classList.remove('entering', transitionClass)
  }, SLIDE_TRANSITION_DURATION)
}

const hasEmphasisClass = (el: Element): boolean => {
  return Array.from(el.classList).some((className) => className.startsWith('emphasis-'))
}

const triggerEmphasisOnEntry = (elements: ReadonlyArray<Element>): void => {
  for (const el of elements) {
    if (!hasEmphasisClass(el)) continue
    el.classList.remove('emphasis-active')
    void (el as HTMLElement).offsetWidth
    el.classList.add('emphasis-active')
    const clearClass = () => el.classList.remove('emphasis-active')
    el.addEventListener('animationend', clearClass, { once: true })
    setTimeout(clearClass, 1200)
  }
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
  const slideTransitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentExitStep = useRef(0)
  const cachedStepEntriesRef = useRef<ReturnType<typeof getStepEntries>>([])
  const cachedExitStepCountRef = useRef(0)
  const emphasizedStepsRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    const count = getSlideElements().length
    totalSlidesRef.current = count
    setTotalSlides(count)

    setActiveSlide(getSlideElements(), currentSlide)
  }, [])

  useEffect(() => {
    const entries = getStepEntries(currentSlide)
    cachedStepEntriesRef.current = entries
    cachedExitStepCountRef.current = getExitStepElements(currentSlide).length
    setStepsForCurrentSlide(entries.length)
  }, [currentSlide])

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current !== null) clearTimeout(exitTimeoutRef.current)
      if (autoStepTimeoutRef.current !== null) clearTimeout(autoStepTimeoutRef.current)
      if (slideTransitionTimeoutRef.current !== null) {
        clearTimeout(slideTransitionTimeoutRef.current)
      }
    }
  }, [])

  const clearAutoStepTimer = useCallback(() => {
    if (autoStepTimeoutRef.current !== null) {
      clearTimeout(autoStepTimeoutRef.current)
      autoStepTimeoutRef.current = null
    }
  }, [])

  const performSlideTransition = useCallback(
    (targetSlide: number) => {
      const slides = getSlideElements()
      const prevEl = slides[currentSlide]
      const nextEl = slides[targetSlide]
      const transitionName = getTransitionName(prevEl, nextEl)

      const previousMagicIds = new Set<string>()
      if (prevEl) {
        prevEl.querySelectorAll('[data-magic-id]').forEach((el) => {
          const id = el.getAttribute('data-magic-id')
          if (id) previousMagicIds.add(id)
        })
      }

      if (slideTransitionTimeoutRef.current !== null) {
        clearTimeout(slideTransitionTimeoutRef.current)
        slideTransitionTimeoutRef.current = null
      }

      if (prevEl && nextEl && prevEl !== nextEl) {
        slideTransitionTimeoutRef.current = applySlideTransitionClasses(
          prevEl,
          nextEl,
          transitionName,
        )
      } else {
        setActiveSlide(slides, targetSlide)
      }

      if (nextEl && previousMagicIds.size > 0) {
        nextEl.querySelectorAll('[data-magic-id]').forEach((el) => {
          const id = el.getAttribute('data-magic-id')
          if (!id || !previousMagicIds.has(id)) return
          const htmlEl = el as HTMLElement
          htmlEl.style.transition = 'none'
          htmlEl.style.opacity = '0'
          htmlEl.style.transform = 'scale(0.96)'

          const cleanupStyles = () => {
            htmlEl.style.transition = ''
            htmlEl.style.opacity = ''
            htmlEl.style.transform = ''
          }

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              htmlEl.style.transition = `opacity ${MAGIC_MOVE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${MAGIC_MOVE_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
              htmlEl.style.opacity = '1'
              htmlEl.style.transform = 'scale(1)'
              htmlEl.addEventListener('transitionend', cleanupStyles, { once: true })
              setTimeout(cleanupStyles, MAGIC_MOVE_DURATION + 50)
            })
          })
        })
      }

      setCurrentSlide(targetSlide)
      setCurrentStep(0)
      setIsExiting(false)
      currentExitStep.current = 0
      emphasizedStepsRef.current = new Set()
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

    const logicalSteps = cachedStepEntriesRef.current.length
    const exitSteps = cachedExitStepCountRef.current

    const previousStepIndex = currentStep - 1
    if (previousStepIndex >= 0 && !emphasizedStepsRef.current.has(previousStepIndex)) {
      const previousEntry = cachedStepEntriesRef.current[previousStepIndex]
      if (previousEntry && previousEntry.elements.some(hasEmphasisClass)) {
        triggerEmphasisOnEntry(previousEntry.elements)
        emphasizedStepsRef.current.add(previousStepIndex)
        return
      }
    }

    if (currentStep < logicalSteps) {
      setCurrentStep(currentStep + 1)
    } else if (exitSteps > 0 && currentExitStep.current < exitSteps) {
      currentExitStep.current++
      toggleClassByThreshold(
        getExitStepElements(currentSlide),
        currentExitStep.current,
        'exit-visible',
      )
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
      toggleClassByThreshold(
        getExitStepElements(currentSlide),
        currentExitStep.current,
        'exit-visible',
      )
    } else if (currentStep > 0) {
      clearAutoStepTimer()
      emphasizedStepsRef.current.delete(currentStep - 1)
      setCurrentStep(currentStep - 1)
    } else if (currentSlide > 0) {
      clearAutoStepTimer()
      startExitTransition(currentSlide - 1)
    }
  }, [currentSlide, currentStep, isExiting, startExitTransition, clearAutoStepTimer])

  useEffect(() => {
    clearAutoStepTimer()

    const entries = cachedStepEntriesRef.current
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

    if (currentStep < entries.length && entries[currentStep]?.isAuto) {
      scheduleAutoStep(currentStep)
    }

    return () => clearAutoStepTimer()
  }, [currentSlide, clearAutoStepTimer])

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
    isExiting,
    goToSlide,
    nextStep,
    previousStep,
  }
}
