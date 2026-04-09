'use client'

import { useEffect, type RefObject } from 'react'

export const toCssLength = (value: number | string): string => {
  return typeof value === 'number' ? `${value}px` : value
}

type UseSlideActiveReplayOptions = {
  ref: RefObject<HTMLElement | null>
  onActive: () => void
  onStandalone?: () => void
  onCleanup?: () => void
  deps: ReadonlyArray<unknown>
}

/**
 * Play a callback in sync with a slide's `.active` lifecycle.
 *
 * - If the element is rendered inside a `[data-slide]` ancestor, `onActive`
 *   runs once if the slide is already active and again whenever it becomes
 *   active after a navigation. `onCleanup` runs on unmount and before each
 *   replay so in-flight timers can be cancelled.
 * - If the element is rendered outside any slide (tests, docs pages,
 *   standalone demos), `onStandalone` runs once on mount so content renders
 *   immediately without waiting for a lifecycle that will never fire.
 * - If `onStandalone` is not provided, `onActive` is used as a fallback so
 *   the standalone case still renders.
 */
export const useSlideActiveReplay = ({
  ref,
  onActive,
  onStandalone,
  onCleanup,
  deps,
}: UseSlideActiveReplayOptions): void => {
  useEffect(() => {
    const slide = ref.current?.closest<HTMLElement>('[data-slide]')

    if (!slide) {
      ;(onStandalone ?? onActive)()
      return
    }

    if (slide.classList.contains('active')) {
      onActive()
    }

    const observer = new MutationObserver(() => {
      if (slide.classList.contains('active')) {
        onCleanup?.()
        onActive()
      }
    })
    observer.observe(slide, { attributes: true, attributeFilter: ['class'] })

    return () => {
      observer.disconnect()
      onCleanup?.()
    }
  }, deps)
}
