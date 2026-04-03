'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getSlideElements, getStepElements } from './slide-dom'

type SlideNavigationState = {
  currentSlide: number
  currentStep: number
  totalSlides: number
  stepsForCurrentSlide: number
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

const applyStepVisibility = (slideIndex: number, visibleSteps: number): void => {
  const steps = getStepElements(slideIndex)
  steps.forEach((step, index) => {
    if (index < visibleSteps) {
      step.classList.add('step-visible')
    } else {
      step.classList.remove('step-visible')
    }
  })
}

export const useSlideNavigation = (): SlideNavigationState => {
  const [currentSlide, setCurrentSlide] = useState(parseSlideFromUrl)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSlides, setTotalSlides] = useState(0)
  const [stepsForCurrentSlide, setStepsForCurrentSlide] = useState(0)
  const totalSlidesRef = useRef(0)

  useEffect(() => {
    const count = getSlideElements().length
    totalSlidesRef.current = count
    setTotalSlides(count)
  }, [])

  useEffect(() => {
    setStepsForCurrentSlide(getStepElements(currentSlide).length)
  }, [currentSlide])

  const goToSlide = useCallback(
    (index: number) => {
      const total = totalSlidesRef.current
      if (total === 0) return
      const clamped = Math.max(0, Math.min(index, total - 1))
      setCurrentSlide(clamped)
      setCurrentStep(0)
    },
    [],
  )

  const nextStep = useCallback(() => {
    const totalSteps = getStepElements(currentSlide).length

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else if (currentSlide < totalSlidesRef.current - 1) {
      goToSlide(currentSlide + 1)
    }
  }, [currentSlide, currentStep, goToSlide])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else if (currentSlide > 0) {
      goToSlide(currentSlide - 1)
    }
  }, [currentSlide, currentStep, goToSlide])

  const prevSlideRef = useRef<number>(-1)

  useEffect(() => {
    const slides = getSlideElements()
    const prevSlide = prevSlideRef.current
    const prevEl = prevSlide >= 0 ? slides[prevSlide] : null
    const nextEl = slides[currentSlide]

    const capturedPositions = new Map<string, DOMRect>()
    if (prevEl) {
      prevEl.querySelectorAll('[data-magic-id]').forEach((el) => {
        const id = el.getAttribute('data-magic-id')
        if (id) capturedPositions.set(id, el.getBoundingClientRect())
      })
    }

    slides.forEach((slide, index) => {
      if (index === currentSlide) {
        slide.classList.add('active')
      } else {
        slide.classList.remove('active')
      }
    })

    if (nextEl && capturedPositions.size > 0) {
      nextEl.querySelectorAll('[data-magic-id]').forEach((el) => {
        const id = el.getAttribute('data-magic-id')
        if (!id) return
        const from = capturedPositions.get(id)
        if (!from) return
        const to = el.getBoundingClientRect()
        const dx = from.left - to.left
        const dy = from.top - to.top
        const sx = from.width / (to.width || 1)
        const sy = from.height / (to.height || 1)
        const htmlEl = el as HTMLElement
        htmlEl.style.transition = 'none'
        htmlEl.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
        htmlEl.style.transformOrigin = 'top left'
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            htmlEl.style.transition = 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)'
            htmlEl.style.transform = 'translate(0, 0) scale(1, 1)'
            const cleanup = () => {
              htmlEl.style.transition = ''
              htmlEl.style.transform = ''
              htmlEl.style.transformOrigin = ''
              htmlEl.removeEventListener('transitionend', cleanup)
            }
            htmlEl.addEventListener('transitionend', cleanup)
          })
        })
      })
    }

    prevSlideRef.current = currentSlide
  }, [currentSlide])

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
