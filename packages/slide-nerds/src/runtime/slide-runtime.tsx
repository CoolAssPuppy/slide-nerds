'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SlideContext } from './slide-context'
import { useSlideNavigation } from './use-slide-navigation'
import { usePresenterMode } from './use-presenter-mode'
import { registerExportApi } from './export-api'
import { SlideControls } from './slide-controls'
import { PresenterView } from './presenter-view'
import { LightTable } from './light-table'

type SlideRuntimeProps = {
  children: React.ReactNode
}

const isPresenterWindow = (): boolean => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('presenter') === 'true'
}

export const SlideRuntime: React.FC<SlideRuntimeProps> = ({ children }) => {
  const navigation = useSlideNavigation()
  const [isLightTable, setIsLightTable] = useState(false)
  const [isPresenter, setIsPresenter] = useState(false)

  useEffect(() => {
    setIsPresenter(isPresenterWindow())
  }, [])

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
    if (isPresenter) return

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
    isPresenter,
  ])

  useEffect(() => {
    if (isPresenter) return
    window.addEventListener('dblclick', navigation.previousStep)
    return () => window.removeEventListener('dblclick', navigation.previousStep)
  }, [navigation.previousStep, isPresenter])

  useEffect(() => {
    registerExportApi()
  }, [])

  const contextValue = useMemo(
    () => ({
      currentSlide: navigation.currentSlide,
      currentStep: navigation.currentStep,
      totalSlides: navigation.totalSlides,
      stepsForCurrentSlide: navigation.stepsForCurrentSlide,
      isExiting: navigation.isExiting,
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
      navigation.isExiting,
      navigation.goToSlide,
      navigation.nextStep,
      navigation.previousStep,
      presenter.isPresenterOpen,
      isLightTable,
      toggleLightTable,
    ],
  )

  if (isPresenter) {
    return (
      <SlideContext.Provider value={contextValue}>
        <div style={{ display: 'none' }}>{children}</div>
        <PresenterView />
      </SlideContext.Provider>
    )
  }

  return (
    <SlideContext.Provider value={contextValue}>
      {children}
      {isLightTable && <LightTable />}
      <SlideControls />
    </SlideContext.Provider>
  )
}
