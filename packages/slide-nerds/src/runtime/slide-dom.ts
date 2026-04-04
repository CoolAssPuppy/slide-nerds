const SLIDE_SELECTOR = '[data-slide]'
const STEP_SELECTOR = '[data-step]'
const NOTES_SELECTOR = '[data-notes]'
const EXIT_STEP_SELECTOR = '[data-exit-step]'
const AUTO_STEP_SELECTOR = '[data-auto-step]'

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

export const getExitStepElements = (slideIndex: number): NodeListOf<Element> => {
  const slide = getSlideAt(slideIndex)
  if (!slide) return queryAll(':not(*)')
  return queryAll(EXIT_STEP_SELECTOR, slide)
}

export const getAutoStepElements = (slideIndex: number): NodeListOf<Element> => {
  const slide = getSlideAt(slideIndex)
  if (!slide) return queryAll(':not(*)')
  return queryAll(AUTO_STEP_SELECTOR, slide)
}

export type StepEntry = {
  elements: ReadonlyArray<Element>
  isAuto: boolean
  autoDelay: number
}

export const getStepEntries = (slideIndex: number): ReadonlyArray<StepEntry> => {
  const slide = getSlideAt(slideIndex)
  if (!slide) return []

  const allSteps = queryAll(`${STEP_SELECTOR}, ${AUTO_STEP_SELECTOR}`, slide)
  const entries: StepEntry[] = []
  let i = 0

  while (i < allSteps.length) {
    const el = allSteps[i]
    const groupName = el.getAttribute('data-step-group')
    const isAuto = el.hasAttribute('data-auto-step')
    const autoDelay = isAuto
      ? parseInt(el.getAttribute('data-auto-step') || '300', 10)
      : 0

    if (groupName) {
      const groupElements: Element[] = [el]
      while (
        i + 1 < allSteps.length &&
        allSteps[i + 1].getAttribute('data-step-group') === groupName
      ) {
        i++
        groupElements.push(allSteps[i])
      }
      entries.push({ elements: groupElements, isAuto, autoDelay })
    } else {
      entries.push({ elements: [el], isAuto, autoDelay })
    }
    i++
  }

  return entries
}

export const hasExitAnimations = (slideIndex: number): boolean => {
  const slide = getSlideAt(slideIndex)
  if (!slide) return false
  const exitClasses = ['exit-fade', 'exit-scale-out', 'exit-slide-up', 'exit-slide-down', 'exit-wipe-left']
  return exitClasses.some((cls) => slide.querySelector(`.${cls}`) !== null)
}

export const getSlidesInfo = (): ReadonlyArray<{ index: number; textContent: string }> => {
  const slides = getSlideElements()
  return Array.from(slides).map((slide, index) => ({
    index,
    textContent: slide.textContent?.slice(0, 100) ?? '',
  }))
}
