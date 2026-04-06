const STEP_SELECTOR = '[data-step], [data-auto-step]'
const AUTO_ANIMATION_SELECTOR = '.auto-fade, .auto-pop, .auto-wipe-right, .auto-slide-down, .auto-slide-up'

const FORCE_VISIBLE_PROPS = ['visibility', 'opacity', 'transform', 'clip-path', 'transition', 'animation'] as const
const FORCE_VISIBLE_VALUES = ['visible', '1', 'none', 'none', 'none', 'none'] as const

const AUTO_FORCE_PROPS = ['opacity', 'transform', 'clip-path', 'animation'] as const

export const showAllSteps = (slideEl: HTMLElement): void => {
  slideEl.querySelectorAll(STEP_SELECTOR).forEach((step) => {
    step.classList.add('step-visible')
    const el = step as HTMLElement
    FORCE_VISIBLE_PROPS.forEach((prop, i) => {
      el.style.setProperty(prop, FORCE_VISIBLE_VALUES[i], 'important')
    })
  })

  slideEl.querySelectorAll(AUTO_ANIMATION_SELECTOR).forEach((el) => {
    const htmlEl = el as HTMLElement
    AUTO_FORCE_PROPS.forEach((prop) => {
      const value = prop === 'opacity' ? '1' : 'none'
      htmlEl.style.setProperty(prop, value, 'important')
    })
  })
}

export const hideAllSteps = (slideEl: HTMLElement): void => {
  slideEl.querySelectorAll(STEP_SELECTOR).forEach((step) => {
    step.classList.remove('step-visible')
    const el = step as HTMLElement
    FORCE_VISIBLE_PROPS.forEach((prop) => {
      el.style.removeProperty(prop)
    })
  })

  slideEl.querySelectorAll(AUTO_ANIMATION_SELECTOR).forEach((el) => {
    const htmlEl = el as HTMLElement
    AUTO_FORCE_PROPS.forEach((prop) => {
      htmlEl.style.removeProperty(prop)
    })
  })
}

export const setActiveSlideForExport = (
  slides: NodeListOf<Element>,
  targetIndex: number,
): void => {
  slides.forEach((s, idx) => {
    const el = s as HTMLElement
    el.classList.toggle('active', idx === targetIndex)
    el.classList.remove('exiting')
  })
}
