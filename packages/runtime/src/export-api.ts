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

const captureSlides = async (): Promise<HTMLCanvasElement[]> => {
  if (typeof document === 'undefined') return []
  const html2canvas = (await import('html2canvas-pro')).default
  const slides = getSlideElements()
  const canvases: HTMLCanvasElement[] = []

  const originalActive = document.querySelector('[data-slide].active')

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i] as HTMLElement

    slides.forEach((s) => {
      ;(s as HTMLElement).classList.remove('active')
      ;(s as HTMLElement).style.display = 'none'
    })
    slide.classList.add('active')
    slide.style.display = 'flex'
    slide.style.position = 'absolute'
    slide.style.inset = '0'
    slide.style.width = `${SLIDE_WIDTH}px`
    slide.style.height = `${SLIDE_HEIGHT}px`

    slide.querySelectorAll('[data-step], [data-auto-step]').forEach((step) => {
      ;(step as HTMLElement).style.visibility = 'visible'
      ;(step as HTMLElement).style.opacity = '1'
      ;(step as HTMLElement).style.transform = 'none'
    })

    slide.querySelectorAll('[data-notes]').forEach((note) => {
      ;(note as HTMLElement).style.display = 'none'
    })

    const canvas = await html2canvas(slide, {
      width: SLIDE_WIDTH,
      height: SLIDE_HEIGHT,
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    })

    canvases.push(canvas)

    slide.style.width = ''
    slide.style.height = ''
    slide.style.position = ''
    slide.style.inset = ''
    slide.querySelectorAll('[data-step], [data-auto-step]').forEach((step) => {
      ;(step as HTMLElement).style.visibility = ''
      ;(step as HTMLElement).style.opacity = ''
      ;(step as HTMLElement).style.transform = ''
    })
  }

  slides.forEach((s) => {
    const el = s as HTMLElement
    el.classList.remove('active')
    el.style.display = ''
  })
  if (originalActive) {
    ;(originalActive as HTMLElement).classList.add('active')
  }

  return canvases
}

const exportPdf = async (): Promise<void> => {
  const { jsPDF } = await import('jspdf')
  const canvases = await captureSlides()

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [SLIDE_WIDTH, SLIDE_HEIGHT],
    hotfixes: ['px_scaling'],
  })

  for (let i = 0; i < canvases.length; i++) {
    if (i > 0) pdf.addPage([SLIDE_WIDTH, SLIDE_HEIGHT], 'landscape')
    const imgData = canvases[i].toDataURL('image/png')
    pdf.addImage(imgData, 'PNG', 0, 0, SLIDE_WIDTH, SLIDE_HEIGHT)
  }

  pdf.save('presentation.pdf')
}

const exportPptx = async (): Promise<void> => {
  const PptxGenJS = (await import(/* webpackIgnore: true */ 'pptxgenjs')).default
  const canvases = await captureSlides()

  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'

  for (const canvas of canvases) {
    const slide = pptx.addSlide()
    const imgData = canvas.toDataURL('image/png')
    slide.addImage({
      data: imgData,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
    })
  }

  const blob = await pptx.write({ outputType: 'blob' }) as Blob
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'presentation.pptx'
  a.click()
  URL.revokeObjectURL(url)
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
