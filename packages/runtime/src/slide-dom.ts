const SLIDE_SELECTOR = '[data-slide]'
const STEP_SELECTOR = '[data-step]'
const NOTES_SELECTOR = '[data-notes]'

const queryAll = (selector: string, root?: Element): NodeListOf<Element> => {
  if (typeof document === 'undefined') return [] as unknown as NodeListOf<Element>
  const target = root ?? document
  return target.querySelectorAll(selector)
}

export const getSlideElements = (): NodeListOf<Element> => {
  return queryAll(SLIDE_SELECTOR)
}

export const getSlideAt = (index: number): Element | null => {
  return getSlideElements()[index] ?? null
}

export const getStepElements = (slideIndex: number): NodeListOf<Element> => {
  const slide = getSlideAt(slideIndex)
  if (!slide) return queryAll(':not(*)')
  return queryAll(STEP_SELECTOR, slide)
}

export const getNotesForSlide = (slideIndex: number): string[] => {
  const slide = getSlideAt(slideIndex)
  if (!slide) return []
  const noteElements = queryAll(NOTES_SELECTOR, slide)
  return Array.from(noteElements).map((el) => el.textContent ?? '')
}

export const getSlidesInfo = (): ReadonlyArray<{ index: number; textContent: string }> => {
  const slides = getSlideElements()
  return Array.from(slides).map((slide, index) => ({
    index,
    textContent: slide.textContent?.slice(0, 100) ?? '',
  }))
}
