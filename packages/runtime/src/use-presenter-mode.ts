import { useCallback, useEffect, useRef, useState } from 'react'

type PresenterMessage = {
  type: 'slide-change' | 'step-change'
  slide: number
  step: number
}

type PresenterModeOptions = {
  currentSlide: number
  currentStep: number
  onSlideChange: (slide: number) => void
  onStepChange?: (step: number) => void
}

type PresenterModeResult = {
  openPresenterWindow: () => void
  closePresenterWindow: () => void
  isPresenterOpen: boolean
}

const CHANNEL_NAME = 'slidenerds-presenter'

export const usePresenterMode = (options: PresenterModeOptions): PresenterModeResult => {
  const { currentSlide, currentStep, onSlideChange, onStepChange } = options
  const channelRef = useRef<BroadcastChannel | null>(null)
  const presenterWindowRef = useRef<Window | null>(null)
  const [isPresenterOpen, setIsPresenterOpen] = useState(false)

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return

    const channel = new BroadcastChannel(CHANNEL_NAME)
    channelRef.current = channel

    channel.onmessage = (event: MessageEvent<PresenterMessage>) => {
      const { type, slide, step } = event.data
      if (type === 'slide-change') {
        onSlideChange(slide)
      } else if (type === 'step-change') {
        onStepChange?.(step)
      }
    }

    return () => {
      channel.close()
      channelRef.current = null
    }
  }, [onSlideChange, onStepChange])

  useEffect(() => {
    channelRef.current?.postMessage({
      type: 'slide-change',
      slide: currentSlide,
      step: currentStep,
    } satisfies PresenterMessage)
  }, [currentSlide, currentStep])

  const openPresenterWindow = useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('presenter', 'true')
    presenterWindowRef.current = window.open(
      url.toString(),
      'slidenerds-presenter',
      'width=1024,height=768',
    )
    setIsPresenterOpen(true)
  }, [])

  const closePresenterWindow = useCallback(() => {
    presenterWindowRef.current?.close()
    presenterWindowRef.current = null
    setIsPresenterOpen(false)
  }, [])

  return {
    openPresenterWindow,
    closePresenterWindow,
    isPresenterOpen,
  }
}
