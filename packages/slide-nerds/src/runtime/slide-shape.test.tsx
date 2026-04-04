import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SlideShape } from './slide-shape'
import type { ShapeType } from './slide-shape'

const ALL_SHAPES: ReadonlyArray<ShapeType> = [
  'circle', 'square', 'rounded-square', 'triangle', 'diamond',
  'pentagon', 'hexagon', 'octagon', 'star', 'plus', 'cloud',
  'arrow-right', 'arrow-left', 'chevron-right', 'pill',
  'badge', 'parallelogram', 'heart',
]

describe('SlideShape', () => {
  it.each(ALL_SHAPES)('should render %s shape with a valid SVG path', (shape) => {
    const { container } = render(<SlideShape shape={shape} size={100} />)
    const path = container.querySelector('path')
    expect(path).not.toBeNull()
    const d = path?.getAttribute('d')
    expect(d).toBeTruthy()
    expect(d).toContain('M ')
  })

  it('should use default size of 120 when no size prop is given', () => {
    const { container } = render(<SlideShape shape="circle" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('120')
    expect(svg?.getAttribute('height')).toBe('120')
  })

  it('should accept custom width and height', () => {
    const { container } = render(<SlideShape shape="square" width={200} height={100} />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('width')).toBe('200')
    expect(svg?.getAttribute('height')).toBe('100')
  })

  it('should render children inside the shape', () => {
    render(
      <SlideShape shape="hexagon" size={80}>
        <span data-testid="inner">Hello</span>
      </SlideShape>,
    )
    expect(screen.getByTestId('inner').textContent).toBe('Hello')
  })

  it('should create a clipPath when imageSrc is provided', () => {
    const { container } = render(
      <SlideShape shape="circle" size={100} imageSrc="/test.jpg" />,
    )
    const clipPath = container.querySelector('clipPath')
    expect(clipPath).not.toBeNull()
    const image = container.querySelector('image')
    expect(image).not.toBeNull()
    expect(image?.getAttribute('href')).toBe('/test.jpg')
  })

  it('should render stroke path over image when stroke is not none', () => {
    const { container } = render(
      <SlideShape shape="circle" size={100} imageSrc="/test.jpg" stroke="red" />,
    )
    const paths = container.querySelectorAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(2)
  })

  it('should not render stroke path over image when stroke is none', () => {
    const { container } = render(
      <SlideShape shape="circle" size={100} imageSrc="/test.jpg" stroke="none" />,
    )
    const paths = container.querySelectorAll('path')
    const strokePaths = Array.from(paths).filter((p) => p.getAttribute('fill') === 'none')
    expect(strokePaths.length).toBe(0)
  })

  it('should pass data-magic-id to the wrapper div', () => {
    const { container } = render(
      <SlideShape shape="star" size={50} data-magic-id="test-id" />,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.getAttribute('data-magic-id')).toBe('test-id')
  })

  it('should pass data-step to the wrapper div', () => {
    const { container } = render(
      <SlideShape shape="diamond" size={50} data-step="" />,
    )
    const wrapper = container.firstElementChild
    expect(wrapper?.hasAttribute('data-step')).toBe(true)
  })

  it('should produce consistent paths for hydration (rounded coordinates)', () => {
    const { container: c1 } = render(<SlideShape shape="hexagon" size={80} />)
    const { container: c2 } = render(<SlideShape shape="hexagon" size={80} />)
    const d1 = c1.querySelector('path')?.getAttribute('d')
    const d2 = c2.querySelector('path')?.getAttribute('d')
    expect(d1).toBe(d2)
    expect(d1).not.toContain('e-')
    expect(d1).not.toContain('e+')
  })
})
