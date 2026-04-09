import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SlideFrame } from './slide-frame'

describe('SlideFrame', () => {
  it('should render the section label, title, and subtitle', () => {
    render(
      <SlideFrame
        sectionLabel="Overview"
        title="The mental model"
        subtitle="Four things to internalize before you type anything."
      >
        <div data-testid="content">Content</div>
      </SlideFrame>,
    )

    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('The mental model')).toBeInTheDocument()
    expect(
      screen.getByText('Four things to internalize before you type anything.'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('content')).toBeInTheDocument()
  })

  it('should omit the header block when all header props are missing', () => {
    render(
      <SlideFrame background="plain">
        <p data-testid="body">Body only</p>
      </SlideFrame>,
    )

    expect(screen.getByTestId('body')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('should apply the chosen mesh background class', () => {
    const { container } = render(
      <SlideFrame background="mesh-cool" title="Title">
        <div />
      </SlideFrame>,
    )

    const outer = container.firstChild as HTMLElement
    expect(outer.className).toContain('bg-mesh-cool')
  })

  it('should skip background class when background is plain', () => {
    const { container } = render(
      <SlideFrame background="plain" title="Title">
        <div />
      </SlideFrame>,
    )

    const outer = container.firstChild as HTMLElement
    expect(outer.className).not.toContain('bg-mesh')
    expect(outer.className).not.toContain('bg-section')
  })
})
