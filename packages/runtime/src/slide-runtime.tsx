import React, { useCallback, useEffect, useMemo } from 'react'
import { SlideContext } from './slide-context'
import { useSlideNavigation } from './use-slide-navigation'
import { usePresenterMode } from './use-presenter-mode'
import { registerExportApi } from './export-api'

type SlideRuntimeProps = {
  children: React.ReactNode
}

export const SlideRuntime: React.FC<SlideRuntimeProps> = ({ children }) => {
  const navigation = useSlideNavigation()

  const handleSlideChange = useCallback(
    (slide: number) => navigation.goToSlide(slide),
    [navigation],
  )

  const presenter = usePresenterMode({
    currentSlide: navigation.currentSlide,
    currentStep: navigation.currentStep,
    onSlideChange: handleSlideChange,
  })

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      switch (event.key) {
        case ' ':
        case 'ArrowRight':
          event.preventDefault()
          navigation.nextStep()
          break
        case 'ArrowLeft':
        case 'Backspace':
          event.preventDefault()
          navigation.previousStep()
          break
        case 'p':
        case 'P':
          event.preventDefault()
          presenter.openPresenterWindow()
          break
        case 'f':
        case 'F':
          event.preventDefault()
          document.documentElement.requestFullscreen?.()
          break
        case 'Escape':
          event.preventDefault()
          document.exitFullscreen?.()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigation, presenter])

  useEffect(() => {
    const handleDoubleClick = () => {
      navigation.previousStep()
    }

    window.addEventListener('dblclick', handleDoubleClick)
    return () => window.removeEventListener('dblclick', handleDoubleClick)
  }, [navigation])

  useEffect(() => {
    registerExportApi()
  }, [])

  const contextValue = useMemo(
    () => ({
      currentSlide: navigation.currentSlide,
      currentStep: navigation.currentStep,
      totalSlides: navigation.totalSlides,
      stepsForCurrentSlide: navigation.stepsForCurrentSlide,
      isPresenterMode: false,
      isLightTable: false,
      goToSlide: navigation.goToSlide,
      nextStep: navigation.nextStep,
      previousStep: navigation.previousStep,
    }),
    [
      navigation.currentSlide,
      navigation.currentStep,
      navigation.totalSlides,
      navigation.stepsForCurrentSlide,
      navigation.goToSlide,
      navigation.nextStep,
      navigation.previousStep,
    ],
  )

  return <SlideContext.Provider value={contextValue}>{children}</SlideContext.Provider>
}
