import { getSlideElements } from './slide-dom.js'

const SLIDE_W = 13.333
const SLIDE_H = 7.5
const PX_TO_INCH_X = SLIDE_W / 1920
const PX_TO_INCH_Y = SLIDE_H / 1080

type PptxSlide = {
  addText: (text: string | Array<{ text: string; options?: Record<string, unknown> }>, options: Record<string, unknown>) => void
  addShape: (shape: string, options: Record<string, unknown>) => void
  addImage: (options: Record<string, unknown>) => void
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

const getRect = (el: Element): { x: number; y: number; w: number; h: number } => {
  const rect = el.getBoundingClientRect()
  return {
    x: rect.left * PX_TO_INCH_X,
    y: rect.top * PX_TO_INCH_Y,
    w: rect.width * PX_TO_INCH_X,
    h: rect.height * PX_TO_INCH_Y,
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

const addTextElement = (slide: PptxSlide, el: Element): void => {
  const text = getTextContent(el).trim()
  if (!text) return

  const cs = window.getComputedStyle(el)
  const rect = getRect(el)

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

const addCardSurface = (slide: PptxSlide, el: Element): void => {
  const cs = window.getComputedStyle(el)
  const rect = getRect(el)

  if (rect.w < 0.1 || rect.h < 0.1) return

  const bgColor = cs.backgroundColor
  if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') return

  const borderRadius = parseFloat(cs.borderRadius) || 0
  const rectRadius = Math.min(borderRadius * PX_TO_INCH_X, 0.2)

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

const addImageElement = (slide: PptxSlide, el: HTMLImageElement): void => {
  const rect = getRect(el)
  if (rect.w < 0.1 || rect.h < 0.1) return

  const src = el.src
  if (!src) return

  try {
    slide.addImage({
      path: src,
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
    })
  } catch {
    // Image might not be accessible
  }
}

const addSvgElement = (slide: PptxSlide, el: SVGSVGElement): void => {
  const rect = getRect(el)
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

const processedElements = new Set<Element>()

const walkElement = (slide: PptxSlide, el: Element): void => {
  if (processedElements.has(el)) return
  if (!isVisible(el)) return
  if (el.hasAttribute('data-notes')) return

  const tag = el.tagName.toLowerCase()

  if (tag === 'img') {
    addImageElement(slide, el as HTMLImageElement)
    processedElements.add(el)
    return
  }

  if (tag === 'svg') {
    addSvgElement(slide, el as SVGSVGElement)
    processedElements.add(el)
    return
  }

  if (el.classList.contains('card-surface')) {
    addCardSurface(slide, el)
  }

  if (isTextNode(el) && !hasTextChildren(el)) {
    addTextElement(slide, el)
    processedElements.add(el)
    return
  }

  Array.from(el.children).forEach((child) => walkElement(slide, child))
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
  const PptxGenJS = (await import(/* webpackIgnore: true */ 'pptxgenjs')).default
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
    processedElements.clear()

    slides.forEach((s, idx) => {
      const el = s as HTMLElement
      el.classList.toggle('active', idx === i)
    })

    const slideEl = slides[i] as HTMLElement
    slideEl.querySelectorAll('[data-step], [data-auto-step]').forEach((step) => {
      step.classList.add('step-visible')
      const htmlEl = step as HTMLElement
      htmlEl.style.setProperty('visibility', 'visible', 'important')
      htmlEl.style.setProperty('opacity', '1', 'important')
      htmlEl.style.setProperty('transform', 'none', 'important')
      htmlEl.style.setProperty('animation', 'none', 'important')
    })
    slideEl.querySelectorAll('.auto-fade, .auto-pop, .auto-wipe-right, .auto-slide-down, .auto-slide-up').forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.setProperty('opacity', '1', 'important')
      htmlEl.style.setProperty('transform', 'none', 'important')
      htmlEl.style.setProperty('animation', 'none', 'important')
    })

    await new Promise((r) => setTimeout(r, 50))

    const pptxSlide = pptx.addSlide()
    pptxSlide.background = { color: getSlideBackground(slideEl) }

    const inner = slideEl.firstElementChild || slideEl
    walkElement(pptxSlide, inner)

    slideEl.querySelectorAll('[data-step], [data-auto-step]').forEach((step) => {
      step.classList.remove('step-visible')
      const htmlEl = step as HTMLElement
      htmlEl.style.removeProperty('visibility')
      htmlEl.style.removeProperty('opacity')
      htmlEl.style.removeProperty('transform')
      htmlEl.style.removeProperty('animation')
    })
    slideEl.querySelectorAll('.auto-fade, .auto-pop, .auto-wipe-right, .auto-slide-down, .auto-slide-up').forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.removeProperty('opacity')
      htmlEl.style.removeProperty('transform')
      htmlEl.style.removeProperty('animation')
    })
  }

  slides.forEach((s, idx) => {
    const el = s as HTMLElement
    el.classList.toggle('active', idx === originalIndex)
  })

  const blob = (await pptx.write({ outputType: 'blob' })) as Blob
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'presentation.pptx'
  a.click()
  URL.revokeObjectURL(url)
}
