import { getSlideElements } from './slide-dom.js'
import { showAllSteps, hideAllSteps, setActiveSlideForExport } from './export-helpers.js'

type ExportOptions = {
  format: 'pdf'
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

    setActiveSlideForExport(slides, i)

    const slideEl = slides[i] as HTMLElement
    showAllSteps(slideEl)

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

    hideAllSteps(slideEl)

    await yieldToMain()
  }

  setActiveSlideForExport(slides, originalIndex)

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

export const registerExportApi = (): void => {
  if (typeof window === 'undefined') return

  window.slidenerds = {
    export: async (options: ExportOptions) => {
      if (options.format === 'pdf') {
        await exportPdf()
      }
    },
  }
}
