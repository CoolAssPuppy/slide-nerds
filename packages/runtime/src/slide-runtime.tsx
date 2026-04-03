import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SlideContext } from './slide-context'
import { useSlideNavigation } from './use-slide-navigation'
import { usePresenterMode } from './use-presenter-mode'
import { registerExportApi } from './export-api'

type SlideRuntimeProps = {
  children: React.ReactNode
}

export const SlideRuntime: React.FC<SlideRuntimeProps> = ({ children }) => {
  const navigation = useSlideNavigation()
  const [isLightTable, setIsLightTable] = useState(false)

  const handleSlideChange = useCallback(
    (slide: number) => navigation.goToSlide(slide),
    [navigation.goToSlide],
  )

  const presenter = usePresenterMode({
    currentSlide: navigation.currentSlide,
    currentStep: navigation.currentStep,
    onSlideChange: handleSlideChange,
  })

  const toggleLightTable = useCallback(() => {
    setIsLightTable((prev) => !prev)
  }, [])

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
        case 'l':
        case 'L':
          event.preventDefault()
          toggleLightTable()
          break
        case 'f':
        case 'F':
          event.preventDefault()
          document.documentElement.requestFullscreen?.()
          break
        case 'Escape':
          event.preventDefault()
          if (isLightTable) {
            setIsLightTable(false)
          } else {
            document.exitFullscreen?.()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    navigation.nextStep,
    navigation.previousStep,
    presenter.openPresenterWindow,
    toggleLightTable,
    isLightTable,
  ])

  useEffect(() => {
    window.addEventListener('dblclick', navigation.previousStep)
    return () => window.removeEventListener('dblclick', navigation.previousStep)
  }, [navigation.previousStep])

  useEffect(() => {
    registerExportApi()
  }, [])

  const contextValue = useMemo(
    () => ({
      currentSlide: navigation.currentSlide,
      currentStep: navigation.currentStep,
      totalSlides: navigation.totalSlides,
      stepsForCurrentSlide: navigation.stepsForCurrentSlide,
      isPresenterMode: presenter.isPresenterOpen,
      isLightTable,
      toggleLightTable,
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
      presenter.isPresenterOpen,
      isLightTable,
      toggleLightTable,
    ],
  )

  return <SlideContext.Provider value={contextValue}>{children}</SlideContext.Provider>
}
