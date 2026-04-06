const SLIDE_SELECTOR = '[data-slide]'
const STEP_SELECTOR = '[data-step]'
const NOTES_SELECTOR = '[data-notes]'
const EXIT_STEP_SELECTOR = '[data-exit-step]'
const AUTO_STEP_SELECTOR = '[data-auto-step]'

const EXIT_CLASSES = [
  'exit-fade',
  'exit-move-up',
  'exit-move-down',
  'exit-move-left',
  'exit-move-right',
  'exit-fly-out-left',
  'exit-fly-out-right',
  'exit-fly-out-top',
  'exit-fly-out-bottom',
  'exit-scale-down',
  'exit-scale-up',
  'exit-zoom-out',
  'exit-spin-out',
  'exit-flip-x',
  'exit-flip-y',
  'exit-wipe-left',
  'exit-wipe-right',
  'exit-wipe-up',
  'exit-wipe-down',
  'exit-iris',
  'exit-blur',
  'exit-drop-off',
  'exit-bounce-off',
  'exit-pop',
  'exit-shrink-rotate',
  'exit-dissolve',
] as const

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

const emptyNodeList = (): NodeListOf<Element> => {
  if (typeof document === 'undefined') return [] as unknown as NodeListOf<Element>
  return document.createDocumentFragment().querySelectorAll('*')
}

const queryWithinSlide = (slideIndex: number, selector: string): NodeListOf<Element> => {
  const slide = getSlideAt(slideIndex)
  if (!slide) return emptyNodeList()
  return queryAll(selector, slide)
}

export const getStepElements = (slideIndex: number): NodeListOf<Element> => {
  return queryWithinSlide(slideIndex, STEP_SELECTOR)
}

export const getExitStepElements = (slideIndex: number): NodeListOf<Element> => {
  return queryWithinSlide(slideIndex, EXIT_STEP_SELECTOR)
}

export const getNotesForSlide = (slideIndex: number): string[] => {
  const noteElements = queryWithinSlide(slideIndex, NOTES_SELECTOR)
  return Array.from(noteElements).map((el) => el.textContent ?? '')
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
    const autoDelay = isAuto ? parseInt(el.getAttribute('data-auto-step') || '300', 10) : 0

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
  return EXIT_CLASSES.some((cls) => slide.querySelector(`.${cls}`) !== null)
}

export const getSlidesInfo = (): ReadonlyArray<{ index: number; textContent: string }> => {
  const slides = getSlideElements()
  return Array.from(slides).map((slide, index) => ({
    index,
    textContent: slide.textContent?.slice(0, 100) ?? '',
  }))
}
