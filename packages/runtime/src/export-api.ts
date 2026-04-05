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
const PPTX_WIDTH_IN = 13.333
const PPTX_HEIGHT_IN = 7.5

const yieldToMain = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0))

const resolveFilteredImgToPng = async (
  origImg: HTMLImageElement,
  cloneImg: HTMLImageElement,
): Promise<void> => {
  const computedFilter = window.getComputedStyle(origImg).filter
  if (!computedFilter || computedFilter === 'none') return

  const isSvg = origImg.src.endsWith('.svg') || origImg.src.includes('.svg?')
  const displayWidth = origImg.getBoundingClientRect().width || origImg.width || 100
  const displayHeight = origImg.getBoundingClientRect().height || origImg.height || 100

  if (isSvg) {
    try {
      const resp = await fetch(origImg.src)
      const svgText = await resp.text()

      const wrapper = document.createElement('div')
      wrapper.style.cssText = `position:fixed;left:-99999px;top:0;width:${displayWidth * 2}px;height:${displayHeight * 2}px;overflow:hidden;`
      const innerImg = document.createElement('img')
      innerImg.style.cssText = `width:${displayWidth * 2}px;height:${displayHeight * 2}px;filter:${computedFilter};`
      const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText)
      innerImg.src = svgDataUri
      wrapper.appendChild(innerImg)
      document.body.appendChild(wrapper)

      await new Promise<void>((r) => {
        if (innerImg.complete) r()
        else innerImg.onload = () => r()
      })
      await yieldToMain()

      const canvas = document.createElement('canvas')
      canvas.width = displayWidth * 2
      canvas.height = displayHeight * 2
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.filter = computedFilter
        ctx.drawImage(innerImg, 0, 0, displayWidth * 2, displayHeight * 2)
        cloneImg.src = canvas.toDataURL('image/png')
        cloneImg.style.setProperty('filter', 'none', 'important')
      }

      document.body.removeChild(wrapper)
    } catch {
      // Fetch failed, leave as-is
    }
  } else {
    const canvas = document.createElement('canvas')
    const width = origImg.naturalWidth || displayWidth
    const height = origImg.naturalHeight || displayHeight
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const tempImg = new Image()
    tempImg.crossOrigin = 'anonymous'
    await new Promise<void>((resolve) => {
      tempImg.onload = () => {
        ctx.filter = computedFilter
        ctx.drawImage(tempImg, 0, 0, width, height)
        try {
          cloneImg.src = canvas.toDataURL('image/png')
          cloneImg.style.setProperty('filter', 'none', 'important')
        } catch {
          // tainted canvas
        }
        resolve()
      }
      tempImg.onerror = () => resolve()
      tempImg.src = origImg.src
    })
  }
}

const resolveInlineSvg = (origSvg: SVGSVGElement, cloneSvg: SVGSVGElement): void => {
  const svgStyle = window.getComputedStyle(origSvg)
  const rootColor = svgStyle.color
  const rootFill = svgStyle.fill

  cloneSvg.setAttribute('fill', rootFill || rootColor)
  cloneSvg.setAttribute('color', rootColor)

  const originalNodes = Array.from(origSvg.querySelectorAll('*'))
  const clonedNodes = Array.from(cloneSvg.querySelectorAll('*'))

  clonedNodes.forEach((clonedNode, idx) => {
    const originalNode = originalNodes[idx] as Element | undefined
    if (!originalNode) return

    const cs = window.getComputedStyle(originalNode)
    clonedNode.setAttribute('fill', cs.fill)
    clonedNode.setAttribute('stroke', cs.stroke)
    clonedNode.setAttribute('fill-opacity', cs.fillOpacity)
    clonedNode.setAttribute('stroke-opacity', cs.strokeOpacity)
    clonedNode.setAttribute('stroke-width', cs.strokeWidth)
    clonedNode.setAttribute('opacity', cs.opacity)
    clonedNode.removeAttribute('class')
    clonedNode.removeAttribute('style')
  })

  cloneSvg.removeAttribute('class')
  cloneSvg.removeAttribute('style')
}

const rasterizeInlineSvg = (
  origSvg: SVGSVGElement,
  cloneSvg: SVGSVGElement,
): Promise<void> => {
  return new Promise((resolve) => {
    const width = origSvg.getBoundingClientRect().width || 24
    const height = origSvg.getBoundingClientRect().height || 24
    const display = window.getComputedStyle(origSvg).display

    resolveInlineSvg(origSvg, cloneSvg)

    cloneSvg.setAttribute('width', String(Math.ceil(width)))
    cloneSvg.setAttribute('height', String(Math.ceil(height)))
    if (!cloneSvg.getAttribute('viewBox')) {
      cloneSvg.setAttribute('viewBox', `0 0 ${Math.ceil(width)} ${Math.ceil(height)}`)
    }
    cloneSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    const svgData = new XMLSerializer().serializeToString(cloneSvg)
    const dataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData)

    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(width) * 2
    canvas.height = Math.ceil(height) * 2
    const ctx = canvas.getContext('2d')
    if (!ctx) { resolve(); return }

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const pngImg = document.createElement('img')
      pngImg.width = Math.ceil(width)
      pngImg.height = Math.ceil(height)
      pngImg.style.width = `${width}px`
      pngImg.style.height = `${height}px`
      pngImg.style.display = display
      pngImg.src = canvas.toDataURL('image/png')
      cloneSvg.parentNode?.replaceChild(pngImg, cloneSvg)
      resolve()
    }
    img.onerror = () => resolve()
    img.src = dataUri
  })
}

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

    const originalSlide = slides[i] as HTMLElement
    const wasHidden = !originalSlide.classList.contains('active')

    if (wasHidden) {
      originalSlide.style.setProperty('display', 'flex', 'important')
      originalSlide.style.setProperty('position', 'fixed', 'important')
      originalSlide.style.setProperty('left', '-99999px', 'important')
      originalSlide.querySelectorAll('[data-step], [data-auto-step]').forEach((step) => {
        ;(step as HTMLElement).style.setProperty('visibility', 'visible', 'important')
        ;(step as HTMLElement).style.setProperty('opacity', '1', 'important')
      })
      await yieldToMain()
    }

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

    clone.querySelectorAll('.auto-fade, .auto-pop, .auto-wipe-right, .auto-slide-down, .auto-slide-up').forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.setProperty('opacity', '1', 'important')
      htmlEl.style.setProperty('transform', 'none', 'important')
      htmlEl.style.setProperty('clip-path', 'none', 'important')
      htmlEl.style.setProperty('animation', 'none', 'important')
    })

    offscreen.appendChild(clone)
    await yieldToMain()

    const originalImgs = Array.from(originalSlide.querySelectorAll('img'))
    const clonedImgs = Array.from(clone.querySelectorAll('img'))
    for (let imgIdx = 0; imgIdx < originalImgs.length; imgIdx++) {
      const cloneImg = clonedImgs[imgIdx] as HTMLImageElement | undefined
      if (!cloneImg) continue
      await resolveFilteredImgToPng(originalImgs[imgIdx], cloneImg)
    }

    const originalSvgs = Array.from(originalSlide.querySelectorAll('svg'))
    const clonedSvgs = Array.from(clone.querySelectorAll('svg'))
    for (let svgIdx = 0; svgIdx < originalSvgs.length; svgIdx++) {
      const cloneSvg = clonedSvgs[svgIdx]
      if (!cloneSvg) continue
      await rasterizeInlineSvg(originalSvgs[svgIdx], cloneSvg)
    }
    await yieldToMain()

    if (wasHidden) {
      originalSlide.style.removeProperty('display')
      originalSlide.style.removeProperty('position')
      originalSlide.style.removeProperty('left')
      originalSlide.querySelectorAll('[data-step], [data-auto-step]').forEach((step) => {
        ;(step as HTMLElement).style.removeProperty('visibility')
        ;(step as HTMLElement).style.removeProperty('opacity')
      })
    }

    clone.querySelectorAll('[data-notes]').forEach((note) => {
      ;(note as HTMLElement).style.display = 'none'
    })

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
        w: PPTX_WIDTH_IN,
        h: PPTX_HEIGHT_IN,
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
