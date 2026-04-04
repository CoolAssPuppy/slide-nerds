'use client'

import { createContext, useContext } from 'react'

export type SlideState = {
  currentSlide: number
  currentStep: number
  totalSlides: number
  stepsForCurrentSlide: number
  isPresenterMode: boolean
  isLightTable: boolean
  toggleLightTable: () => void
  goToSlide: (index: number) => void
  nextStep: () => void
  previousStep: () => void
}

const DEFAULT_STATE: SlideState = {
  currentSlide: 0,
  currentStep: 0,
  totalSlides: 0,
  stepsForCurrentSlide: 0,
  isPresenterMode: false,
  isLightTable: false,
  toggleLightTable: () => {},
  goToSlide: () => {},
  nextStep: () => {},
  previousStep: () => {},
}

export const SlideContext = createContext<SlideState>(DEFAULT_STATE)

export const useSlideState = (): SlideState => useContext(SlideContext)
