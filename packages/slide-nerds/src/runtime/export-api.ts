import { getSlideElements } from './slide-dom.js'

type ExportFormat = 'pdf' | 'pptx'

type ExportOptions = {
  format: ExportFormat
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

const captureSlides = async (): Promise<string[]> => {
  if (typeof document === 'undefined') return []
  const html2canvas = (await import('html2canvas-pro')).default
  const slides = getSlideElements()
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

  for (let i = 0; i < slides.length; i++) {
    const clone = slides[i].cloneNode(true) as HTMLElement

    clone.style.position = 'relative'
    clone.style.display = 'flex'
    clone.style.width = `${SLIDE_WIDTH}px`
    clone.style.height = `${SLIDE_HEIGHT}px`
    clone.style.overflow = 'hidden'
    clone.classList.add('active')

    clone.querySelectorAll('[data-step], [data-auto-step]').forEach((step) => {
      step.classList.add('step-visible')
    })

    clone.querySelectorAll('[data-notes]').forEach((note) => {
      ;(note as HTMLElement).style.display = 'none'
    })

    offscreen.appendChild(clone)

    const canvas = await html2canvas(clone, {
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    })

    images.push(canvas.toDataURL('image/png'))
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

const exportPdf = async (): Promise<void> => {
  const { jsPDF } = await import('jspdf')
  const images = await captureSlides()
  if (images.length === 0) return

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [SLIDE_WIDTH, SLIDE_HEIGHT],
    hotfixes: ['px_scaling'],
  })

  for (let i = 0; i < images.length; i++) {
    if (i > 0) pdf.addPage([SLIDE_WIDTH, SLIDE_HEIGHT], 'landscape')
    pdf.addImage(images[i], 'PNG', 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT)
  }

  pdf.save('presentation.pdf')
}

const exportPptx = async (): Promise<void> => {
  const PptxGenJS = (await import(/* webpackIgnore: true */ 'pptxgenjs')).default
  const images = await captureSlides()
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

  const blob = await pptx.write({ outputType: 'blob' }) as Blob
  downloadBlob(blob, 'presentation.pptx')
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
