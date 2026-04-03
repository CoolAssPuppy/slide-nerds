const SLIDE_SELECTOR = '[data-slide]'
const STEP_SELECTOR = '[data-step]'
const NOTES_SELECTOR = '[data-notes]'

const isSSR = typeof document === 'undefined'

const EMPTY_NODE_LIST = isSSR
  ? ([] as unknown as NodeListOf<Element>)
  : document.querySelectorAll('.slidenerds-empty')

export const getSlideElements = (): NodeListOf<Element> => {
  if (isSSR) return EMPTY_NODE_LIST
  return document.querySelectorAll(SLIDE_SELECTOR)
}

export const getSlideAt = (index: number): Element | null => {
  const slides = getSlideElements()
  return slides[index] ?? null
}

export const getStepElements = (slideIndex: number): NodeListOf<Element> => {
  const slide = getSlideAt(slideIndex)
  if (!slide) return EMPTY_NODE_LIST
  return slide.querySelectorAll(STEP_SELECTOR)
}

export const getNotesForSlide = (slideIndex: number): string[] => {
  const slide = getSlideAt(slideIndex)
  if (!slide) return []
  const noteElements = slide.querySelectorAll(NOTES_SELECTOR)
  return Array.from(noteElements).map((el) => el.textContent ?? '')
}

export const getSlidesInfo = (): ReadonlyArray<{ index: number; textContent: string }> => {
  const slides = getSlideElements()
  return Array.from(slides).map((slide, index) => ({
    index,
    textContent: slide.textContent?.slice(0, 100) ?? '',
  }))
}
