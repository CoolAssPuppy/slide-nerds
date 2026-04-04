import { describe, it, expect, beforeEach } from 'vitest'
import {
  getSlideElements,
  getSlideAt,
  getStepElements,
  getExitStepElements,
  getNotesForSlide,
  getStepEntries,
  hasExitAnimations,
  getSlidesInfo,
} from './slide-dom'

const clearDOM = () => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }
}

const createSlide = (content: string): HTMLElement => {
  const slide = document.createElement('section')
  slide.setAttribute('data-slide', '')
  slide.textContent = content
  return slide
}

describe('slide-dom', () => {
  beforeEach(() => {
    clearDOM()
  })

  it('should find all slide elements', () => {
    const container = document.createElement('div')
    container.appendChild(createSlide('A'))
    container.appendChild(createSlide('B'))
    document.body.appendChild(container)

    expect(getSlideElements().length).toBe(2)
  })

  it('should return a slide by index', () => {
    const container = document.createElement('div')
    const slide = createSlide('Target')
    container.appendChild(createSlide('First'))
    container.appendChild(slide)
    document.body.appendChild(container)

    expect(getSlideAt(1)).toBe(slide)
    expect(getSlideAt(5)).toBeNull()
  })

  it('should return step elements for a slide', () => {
    const slide = createSlide('')
    const step1 = document.createElement('div')
    step1.setAttribute('data-step', '')
    const step2 = document.createElement('div')
    step2.setAttribute('data-step', '')
    slide.appendChild(step1)
    slide.appendChild(step2)
    document.body.appendChild(slide)

    expect(getStepElements(0).length).toBe(2)
  })

  it('should return exit step elements', () => {
    const slide = createSlide('')
    const exitStep = document.createElement('div')
    exitStep.setAttribute('data-exit-step', '')
    slide.appendChild(exitStep)
    document.body.appendChild(slide)

    expect(getExitStepElements(0).length).toBe(1)
  })

  it('should return speaker notes for a slide', () => {
    const slide = createSlide('')
    const notes = document.createElement('div')
    notes.setAttribute('data-notes', '')
    notes.textContent = 'Talk about revenue'
    slide.appendChild(notes)
    document.body.appendChild(slide)

    expect(getNotesForSlide(0)).toEqual(['Talk about revenue'])
  })

  it('should return empty notes for a slide without notes', () => {
    document.body.appendChild(createSlide('No notes'))
    expect(getNotesForSlide(0)).toEqual([])
  })

  it('should group step entries by data-step-group', () => {
    const slide = createSlide('')
    const a = document.createElement('div')
    a.setAttribute('data-step', '')
    a.setAttribute('data-step-group', 'row1')
    const b = document.createElement('div')
    b.setAttribute('data-step', '')
    b.setAttribute('data-step-group', 'row1')
    const c = document.createElement('div')
    c.setAttribute('data-step', '')
    slide.append(a, b, c)
    document.body.appendChild(slide)

    const entries = getStepEntries(0)
    expect(entries.length).toBe(2)
    expect(entries[0].elements.length).toBe(2)
    expect(entries[1].elements.length).toBe(1)
  })

  it('should mark auto-step entries', () => {
    const slide = createSlide('')
    const auto = document.createElement('div')
    auto.setAttribute('data-auto-step', '500')
    slide.appendChild(auto)
    document.body.appendChild(slide)

    const entries = getStepEntries(0)
    expect(entries[0].isAuto).toBe(true)
    expect(entries[0].autoDelay).toBe(500)
  })

  it('should default auto-step delay to 300', () => {
    const slide = createSlide('')
    const auto = document.createElement('div')
    auto.setAttribute('data-auto-step', '')
    slide.appendChild(auto)
    document.body.appendChild(slide)

    const entries = getStepEntries(0)
    expect(entries[0].autoDelay).toBe(300)
  })

  it('should detect exit animations on a slide', () => {
    const slide = createSlide('')
    const el = document.createElement('div')
    el.classList.add('exit-fade')
    slide.appendChild(el)
    document.body.appendChild(slide)

    expect(hasExitAnimations(0)).toBe(true)
  })

  it('should return false when no exit animations exist', () => {
    document.body.appendChild(createSlide('No exits'))
    expect(hasExitAnimations(0)).toBe(false)
  })

  it('should return slide info with truncated text', () => {
    const container = document.createElement('div')
    container.appendChild(createSlide('Short'))
    container.appendChild(createSlide('A'.repeat(200)))
    document.body.appendChild(container)

    const info = getSlidesInfo()
    expect(info.length).toBe(2)
    expect(info[0].textContent).toBe('Short')
    expect(info[1].textContent.length).toBe(100)
  })
})
