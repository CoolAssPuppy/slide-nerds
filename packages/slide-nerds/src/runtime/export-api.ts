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
): Promise<string[]> => {
  if (typeof document === 'undefined') return []
  const html2canvas = (await import('html2canvas-pro')).default
  const slides = getSlideElements()
  const total = slides.length
  const images: string[] = []

  const offscreen = document.createElement('div')
  offscreen.style.position = 'fixed'
  offscreen.style.left = '-99999px'
  offscreen.style.top = '0'
  offscreen.style.width = `${SLIDE_WIDTH}px`
  offscreen.style.height = `${SLIDE_HEIGHT}px`
  offscreen.style.overflow = 'hidden'
  offscreen.style.zIndex = '-1'
  document.body.appendChild(offscreen)

  for (let i = 0; i < total; i++) {
    onProgress?.(i + 1, total)
    await yieldToMain()

    const clone = slides[i].cloneNode(true) as HTMLElement
    clone.style.position = 'relative'
    clone.style.display = 'flex'
    clone.style.width = `${SLIDE_WIDTH}px`
    clone.style.height = `${SLIDE_HEIGHT}px`
    clone.style.overflow = 'hidden'
    clone.classList.add('active')

    clone.querySelectorAll('[data-step], [data-auto-step]').forEach((step) => {
      const el = step as HTMLElement
      el.style.setProperty('visibility', 'visible', 'important')
      el.style.setProperty('opacity', '1', 'important')
      el.style.setProperty('transform', 'none', 'important')
      el.style.setProperty('clip-path', 'none', 'important')
      el.style.setProperty('transition', 'none', 'important')
      el.style.setProperty('animation', 'none', 'important')
    })

    const originalSlide = slides[i] as HTMLElement
    const originalSvgs = originalSlide.querySelectorAll('svg')
    const clonedSvgs = clone.querySelectorAll('svg')
    originalSvgs.forEach((origSvg, svgIdx) => {
      const cloneSvg = clonedSvgs[svgIdx]
      if (!cloneSvg) return
      const computedColor = window.getComputedStyle(origSvg).color
      cloneSvg.querySelectorAll('*').forEach((el) => {
        if (el.getAttribute('fill') === 'currentColor') el.setAttribute('fill', computedColor)
        if (el.getAttribute('stroke') === 'currentColor') el.setAttribute('stroke', computedColor)
      })
      if (cloneSvg.getAttribute('fill') === 'currentColor' || !cloneSvg.getAttribute('fill')) {
        cloneSvg.setAttribute('fill', computedColor)
      }
    })

    const originalImgs = originalSlide.querySelectorAll('img')
    const clonedImgs = clone.querySelectorAll('img')
    originalImgs.forEach((origImg, imgIdx) => {
      const cloneImg = clonedImgs[imgIdx] as HTMLElement | undefined
      if (!cloneImg) return
      const computedFilter = window.getComputedStyle(origImg).filter
      if (computedFilter && computedFilter !== 'none') {
        cloneImg.style.setProperty('filter', computedFilter, 'important')
      }
    })

    clone.querySelectorAll('.auto-fade, .auto-pop, .auto-wipe-right, .auto-slide-down, .auto-slide-up').forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.setProperty('opacity', '1', 'important')
      htmlEl.style.setProperty('transform', 'none', 'important')
      htmlEl.style.setProperty('clip-path', 'none', 'important')
      htmlEl.style.setProperty('animation', 'none', 'important')
    })

    clone.querySelectorAll('[data-notes]').forEach((note) => {
      ;(note as HTMLElement).style.display = 'none'
    })

    clone.querySelectorAll('::after').length // force layout

    offscreen.appendChild(clone)
    await yieldToMain()

    const canvas = await html2canvas(clone, {
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      scale: 1,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      imageTimeout: 5000,
    })

    images.push(canvas.toDataURL('image/jpeg', 0.92))
    offscreen.removeChild(clone)
  }

  document.body.removeChild(offscreen)
  return images
}

const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const showProgress = (): {
  update: (current: number, total: number) => void
  remove: () => void
} => {
  const overlay = document.createElement('div')
  overlay.style.cssText =
    'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);font-family:system-ui,-apple-system,sans-serif;'
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
    const images = await captureSlides(progress.update)
    if (images.length === 0) return

    progress.update(images.length, images.length)

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
    const PptxGenJS = (await import(/* webpackIgnore: true */ 'pptxgenjs')).default
    const images = await captureSlides(progress.update)
    if (images.length === 0) return

    const pptx = new PptxGenJS()
    pptx.layout = 'LAYOUT_WIDE'

    for (const imgData of images) {
      const slide = pptx.addSlide()
      slide.addImage({
        data: imgData,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      })
    }

    const blob = (await pptx.write({ outputType: 'blob' })) as Blob
    downloadBlob(blob, 'presentation.pptx')
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
