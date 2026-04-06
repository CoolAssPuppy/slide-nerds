import { getSlideElements, getNotesForSlide } from './slide-dom.js'
import { showAllSteps, hideAllSteps, setActiveSlideForExport } from './export-helpers.js'

const SLIDE_W_IN = 13.333
const SLIDE_H_IN = 7.5

type SlideCalibration = {
  originX: number
  originY: number
  pxPerInchX: number
  pxPerInchY: number
}

const calibrateToSlide = (slideEl: Element): SlideCalibration => {
  const rect = slideEl.getBoundingClientRect()
  return {
    originX: rect.left,
    originY: rect.top,
    pxPerInchX: rect.width / SLIDE_W_IN,
    pxPerInchY: rect.height / SLIDE_H_IN,
  }
}

type PptxSlide = {
  addText: (text: string | Array<{ text: string; options?: Record<string, unknown> }>, options: Record<string, unknown>) => void
  addShape: (shape: string, options: Record<string, unknown>) => void
  addImage: (options: Record<string, unknown>) => void
  addNotes: (notes: string) => void
  background: Record<string, unknown>
}

type PptxGen = {
  layout: string
  addSlide: () => PptxSlide
  write: (options: { outputType: string }) => Promise<unknown>
}

const rgbToHex = (rgb: string): string => {
  if (rgb.startsWith('#')) return rgb.replace('#', '')
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return '000000'
  const r = parseInt(match[1]).toString(16).padStart(2, '0')
  const g = parseInt(match[2]).toString(16).padStart(2, '0')
  const b = parseInt(match[3]).toString(16).padStart(2, '0')
  return `${r}${g}${b}`
}

const parseOpacity = (color: string): number => {
  const match = color.match(/rgba?\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)/)
  return match ? parseFloat(match[1]) * 100 : 100
}

const pxToFontPt = (pxStr: string): number => {
  const px = parseFloat(pxStr)
  return Math.round(px * 0.75)
}

const getRect = (el: Element, cal: SlideCalibration): { x: number; y: number; w: number; h: number } => {
  const rect = el.getBoundingClientRect()
  const x = (rect.left - cal.originX) / cal.pxPerInchX
  const y = (rect.top - cal.originY) / cal.pxPerInchY
  const w = rect.width / cal.pxPerInchX
  const h = rect.height / cal.pxPerInchY
  return {
    x: Math.max(0, x),
    y: Math.max(0, y),
    w: Math.min(w, SLIDE_W_IN - x),
    h: Math.min(h, SLIDE_H_IN - y),
  }
}

const isVisible = (el: Element): boolean => {
  const cs = window.getComputedStyle(el)
  if (cs.display === 'none') return false
  if (cs.visibility === 'hidden' && !el.classList.contains('step-visible')) return false
  if (parseFloat(cs.opacity) === 0 && !el.classList.contains('step-visible')) return false
  return true
}

const isTextNode = (el: Element): boolean => {
  const tag = el.tagName.toLowerCase()
  return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'blockquote', 'cite', 'li', 'a', 'strong', 'em', 'code', 'kbd'].includes(tag)
}

const getTextContent = (el: Element): string => {
  let text = ''
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || ''
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element
      if (child.tagName === 'BR') {
        text += '\n'
      } else if (!child.hasAttribute('data-notes')) {
        text += getTextContent(child)
      }
    }
  })
  return text
}

const addTextElement = (slide: PptxSlide, el: Element, cal: SlideCalibration): void => {
  const text = getTextContent(el).trim()
  if (!text) return

  const cs = window.getComputedStyle(el)
  const rect = getRect(el, cal)

  if (rect.w < 0.1 || rect.h < 0.1) return

  const fontSize = pxToFontPt(cs.fontSize)
  const color = rgbToHex(cs.color)
  const opacity = parseOpacity(cs.color)
  const isBold = parseInt(cs.fontWeight) >= 600
  const isItalic = cs.fontStyle === 'italic'
  const align = cs.textAlign === 'center' ? 'center' : cs.textAlign === 'right' ? 'right' : 'left'
  const letterSpacing = parseFloat(cs.letterSpacing) || 0
  const isUppercase = cs.textTransform === 'uppercase'

  const displayText = isUppercase ? text.toUpperCase() : text

  slide.addText(displayText, {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    fontSize,
    fontFace: 'Arial',
    color,
    transparency: 100 - opacity,
    bold: isBold,
    italic: isItalic,
    align,
    valign: 'top',
    charSpacing: letterSpacing > 0 ? letterSpacing * 0.75 : undefined,
    wrap: true,
    shrinkText: false,
  })
}

const addCardSurface = (slide: PptxSlide, el: Element, cal: SlideCalibration): void => {
  const cs = window.getComputedStyle(el)
  const rect = getRect(el, cal)

  if (rect.w < 0.1 || rect.h < 0.1) return

  const bgColor = cs.backgroundColor
  if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') return

  const borderRadius = parseFloat(cs.borderRadius) || 0
  const rectRadius = Math.min(borderRadius / cal.pxPerInchX, 0.2)

  slide.addShape('roundRect', {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    fill: { color: rgbToHex(bgColor), transparency: 100 - parseOpacity(bgColor) },
    rectRadius,
    line: cs.borderWidth !== '0px' ? {
      color: rgbToHex(cs.borderColor),
      width: parseFloat(cs.borderWidth) * 0.75,
      transparency: 100 - parseOpacity(cs.borderColor),
    } : undefined,
  })
}

const imgToBase64 = async (img: HTMLImageElement): Promise<string | null> => {
  try {
    const canvas = document.createElement('canvas')
    const width = img.naturalWidth || img.width || 100
    const height = img.naturalHeight || img.height || 100
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(img, 0, 0, width, height)
    return canvas.toDataURL('image/png')
  } catch {
    try {
      const resp = await fetch(img.src)
      const blob = await resp.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }
}

const addImageElement = async (slide: PptxSlide, el: HTMLImageElement, cal: SlideCalibration): Promise<void> => {
  const rect = getRect(el, cal)
  if (rect.w < 0.1 || rect.h < 0.1) return

  const data = await imgToBase64(el)
  if (!data) return

  try {
    slide.addImage({
      data,
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
    })
  } catch {
    // Image conversion failed
  }
}

const addSvgElement = (slide: PptxSlide, el: SVGSVGElement, cal: SlideCalibration): void => {
  const rect = getRect(el, cal)
  if (rect.w < 0.1 || rect.h < 0.1) return

  const cs = window.getComputedStyle(el)
  const color = cs.color

  const clone = el.cloneNode(true) as SVGSVGElement
  clone.querySelectorAll('*').forEach((node) => {
    const origNode = el.querySelector(node.tagName) // rough match
    if (origNode) {
      const nodeCs = window.getComputedStyle(origNode)
      if (node.getAttribute('fill') === 'currentColor' || !node.getAttribute('fill')) {
        node.setAttribute('fill', nodeCs.fill || color)
      }
      if (node.getAttribute('stroke') === 'currentColor') {
        node.setAttribute('stroke', nodeCs.stroke || color)
      }
    }
  })
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const svgData = new XMLSerializer().serializeToString(clone)
  const dataUri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))

  try {
    slide.addImage({
      data: dataUri,
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
    })
  } catch {
    // SVG might not be valid
  }
}

type WalkContext = {
  cal: SlideCalibration
  processed: Set<Element>
}

const walkElement = async (slide: PptxSlide, el: Element, ctx: WalkContext): Promise<void> => {
  if (ctx.processed.has(el)) return
  if (!isVisible(el)) return
  if (el.hasAttribute('data-notes')) return

  const tag = el.tagName.toLowerCase()

  if (tag === 'img') {
    await addImageElement(slide, el as HTMLImageElement, ctx.cal)
    ctx.processed.add(el)
    return
  }

  if (tag === 'svg') {
    addSvgElement(slide, el as SVGSVGElement, ctx.cal)
    ctx.processed.add(el)
    return
  }

  if (el.classList.contains('card-surface')) {
    addCardSurface(slide, el, ctx.cal)
  }

  if (isTextNode(el) && !hasTextChildren(el)) {
    addTextElement(slide, el, ctx.cal)
    ctx.processed.add(el)
    return
  }

  for (const child of Array.from(el.children)) {
    await walkElement(slide, child, ctx)
  }
}

const hasTextChildren = (el: Element): boolean => {
  return Array.from(el.children).some((child) => {
    const tag = child.tagName.toLowerCase()
    return isTextNode(child) || tag === 'div' || tag === 'ul' || tag === 'ol'
  })
}

const getSlideBackground = (slideEl: Element): string => {
  const cs = window.getComputedStyle(slideEl)
  const bg = cs.backgroundColor
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
    return rgbToHex(bg)
  }

  const inner = slideEl.firstElementChild
  if (inner) {
    const innerCs = window.getComputedStyle(inner)
    const innerBg = innerCs.backgroundColor
    if (innerBg && innerBg !== 'rgba(0, 0, 0, 0)' && innerBg !== 'transparent') {
      return rgbToHex(innerBg)
    }
  }

  return '171717'
}

export const exportNativePptx = async (
  onProgress?: (current: number, total: number) => void,
): Promise<void> => {
  const PptxGenJS = (await import('pptxgenjs')).default
  const slides = getSlideElements()
  const total = slides.length

  const currentlyActive = document.querySelector('[data-slide].active')
  const originalIndex = currentlyActive
    ? Array.from(slides).indexOf(currentlyActive)
    : 0

  const pptx = new PptxGenJS() as unknown as PptxGen
  pptx.layout = 'LAYOUT_WIDE'

  for (let i = 0; i < total; i++) {
    onProgress?.(i + 1, total)

    setActiveSlideForExport(slides, i)

    const slideEl = slides[i] as HTMLElement
    showAllSteps(slideEl)

    await new Promise((r) => setTimeout(r, 50))

    const cal = calibrateToSlide(slideEl)
    const ctx: WalkContext = { cal, processed: new Set() }

    const pptxSlide = pptx.addSlide()
    pptxSlide.background = { color: getSlideBackground(slideEl) }

    const inner = slideEl.firstElementChild || slideEl
    await walkElement(pptxSlide, inner, ctx)

    const notes = getNotesForSlide(i)
    if (notes.length > 0) {
      pptxSlide.addNotes(notes.join('\n'))
    }

    hideAllSteps(slideEl)
  }

  setActiveSlideForExport(slides, originalIndex)

  const blob = (await pptx.write({ outputType: 'blob' })) as Blob
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'presentation.pptx'
  a.click()
  URL.revokeObjectURL(url)
}
