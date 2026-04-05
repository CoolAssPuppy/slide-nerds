import { getSlideElements } from './slide-dom.js'

type ExportFormat = 'pdf' | 'pptx'

type ExportOptions = {
  format: ExportFormat
  onProgress?: (current: number, total: number) => void
}

type SlidenerdsApi = {
  export: (options: ExportOptions) => Promise<void>
}

declare global {
  interface Window {
    slidenerds: SlidenerdsApi
  }
}

const SLIDE_WIDTH = 1920
const SLIDE_HEIGHT = 1080
const yieldToMain = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0))

const captureSlides = async (
  onProgress?: (current: number, total: number) => void,
  overlay?: HTMLElement,
): Promise<string[]> => {
  if (typeof document === 'undefined') return []
  const html2canvas = (await import('html2canvas-pro')).default
  const slides = getSlideElements()
  const total = slides.length
  const images: string[] = []

  const currentlyActive = document.querySelector('[data-slide].active')
  const originalIndex = currentlyActive
    ? Array.from(slides).indexOf(currentlyActive)
    : 0

  for (let i = 0; i < total; i++) {
    onProgress?.(i + 1, total)

    slides.forEach((s, idx) => {
      const el = s as HTMLElement
      el.classList.toggle('active', idx === i)
      el.classList.remove('exiting')
    })

    const slideEl = slides[i] as HTMLElement
    slideEl.querySelectorAll('[data-step], [data-auto-step]').forEach((step) => {
      step.classList.add('step-visible')
      const el = step as HTMLElement
      el.style.setProperty('visibility', 'visible', 'important')
      el.style.setProperty('opacity', '1', 'important')
      el.style.setProperty('transform', 'none', 'important')
      el.style.setProperty('clip-path', 'none', 'important')
      el.style.setProperty('transition', 'none', 'important')
      el.style.setProperty('animation', 'none', 'important')
    })

    slideEl.querySelectorAll('.auto-fade, .auto-pop, .auto-wipe-right, .auto-slide-down, .auto-slide-up').forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.setProperty('opacity', '1', 'important')
      htmlEl.style.setProperty('transform', 'none', 'important')
      htmlEl.style.setProperty('clip-path', 'none', 'important')
      htmlEl.style.setProperty('animation', 'none', 'important')
    })

    if (overlay) {
      overlay.style.zIndex = '99999'
    }

    await yieldToMain()
    await new Promise((r) => setTimeout(r, 100))

    const canvas = await html2canvas(slideEl, {
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      scale: 1,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      imageTimeout: 5000,
      ignoreElements: (el) => {
        return el === overlay ||
          el.hasAttribute('data-notes') ||
          el.classList?.contains('slide-controls-root')
      },
    })

    images.push(canvas.toDataURL('image/jpeg', 0.92))

    slideEl.querySelectorAll('[data-step], [data-auto-step]').forEach((step) => {
      step.classList.remove('step-visible')
      const el = step as HTMLElement
      el.style.removeProperty('visibility')
      el.style.removeProperty('opacity')
      el.style.removeProperty('transform')
      el.style.removeProperty('clip-path')
      el.style.removeProperty('transition')
      el.style.removeProperty('animation')
    })

    slideEl.querySelectorAll('.auto-fade, .auto-pop, .auto-wipe-right, .auto-slide-down, .auto-slide-up').forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.removeProperty('opacity')
      htmlEl.style.removeProperty('transform')
      htmlEl.style.removeProperty('clip-path')
      htmlEl.style.removeProperty('animation')
    })

    await yieldToMain()
  }

  slides.forEach((s, idx) => {
    const el = s as HTMLElement
    el.classList.toggle('active', idx === originalIndex)
    el.classList.remove('exiting')
  })

  return images
}

const showProgress = (): {
  element: HTMLElement
  update: (current: number, total: number) => void
  remove: () => void
} => {
  const overlay = document.createElement('div')
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.95);font-family:system-ui,-apple-system,sans-serif;'
  const box = document.createElement('div')
  box.style.cssText =
    'background:rgba(0,0,0,0.9);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px 32px;text-align:center;color:rgba(255,255,255,0.85);'
  const label = document.createElement('div')
  label.style.cssText = 'font-size:13px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:8px;'
  label.textContent = 'Exporting'
  const status = document.createElement('div')
  status.style.cssText = 'font-size:18px;font-weight:500;'
  status.textContent = 'Preparing...'
  box.appendChild(label)
  box.appendChild(status)
  overlay.appendChild(box)
  document.body.appendChild(overlay)

  return {
    element: overlay,
    update: (current: number, total: number) => {
      status.textContent = `Slide ${current} of ${total}`
    },
    remove: () => {
      document.body.removeChild(overlay)
    },
  }
}

const exportPdf = async (): Promise<void> => {
  const progress = showProgress()
  try {
    const { jsPDF } = await import('jspdf')
    const images = await captureSlides(progress.update, progress.element)
    if (images.length === 0) return

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [SLIDE_WIDTH, SLIDE_HEIGHT],
      hotfixes: ['px_scaling'],
    })

    for (let i = 0; i < images.length; i++) {
      if (i > 0) pdf.addPage([SLIDE_WIDTH, SLIDE_HEIGHT], 'landscape')
      pdf.addImage(images[i], 'JPEG', 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT)
    }

    pdf.save('presentation.pdf')
  } finally {
    progress.remove()
  }
}

const exportPptx = async (): Promise<void> => {
  const progress = showProgress()
  try {
    const { exportNativePptx } = await import('./pptx-export.js')
    await exportNativePptx(progress.update)
  } finally {
    progress.remove()
  }
}

export const registerExportApi = (): void => {
  if (typeof window === 'undefined') return

  window.slidenerds = {
    export: async (options: ExportOptions) => {
      switch (options.format) {
        case 'pdf':
          await exportPdf()
          break
        case 'pptx':
          await exportPptx()
          break
      }
    },
  }
}
