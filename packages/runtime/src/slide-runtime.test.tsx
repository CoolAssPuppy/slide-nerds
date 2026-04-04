import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { SlideRuntime } from './slide-runtime'
import { useSlideState } from './slide-context'

const clearDOM = () => {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild)
  }
}

const SlideStateDisplay: React.FC = () => {
  const state = useSlideState()
  return (
    <div>
      <span data-testid="current-slide">{state.currentSlide}</span>
      <span data-testid="total-slides">{state.totalSlides}</span>
      <span data-testid="is-light-table">{String(state.isLightTable)}</span>
    </div>
  )
}

const TestDeck: React.FC = () => (
  <SlideRuntime>
    <div>
      <section data-slide="">
        <p>Slide 1</p>
      </section>
      <section data-slide="">
        <p>Slide 2</p>
      </section>
      <section data-slide="">
        <p>Slide 3</p>
      </section>
    </div>
    <SlideStateDisplay />
  </SlideRuntime>
)

const DemoCounter: React.FC = () => {
  const [count, setCount] = React.useState(0)

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      Demo count: {count}
    </button>
  )
}

const InteractiveDeck: React.FC = () => (
  <SlideRuntime>
    <section data-slide="">
      <h2>Live demo</h2>
      <DemoCounter />
    </section>
  </SlideRuntime>
)

describe('SlideRuntime', () => {
  beforeEach(() => {
    clearDOM()
    window.history.replaceState({}, '', '/')
  })

  it('should render children', () => {
    render(<TestDeck />)
    expect(screen.getByText('Slide 1')).toBeInTheDocument()
    expect(screen.getByText('Slide 2')).toBeInTheDocument()
  })

  it('should provide slide context to children', async () => {
    render(<TestDeck />)
    expect(screen.getByTestId('current-slide').textContent).toBe('0')
    await waitFor(() => {
      expect(screen.getByTestId('total-slides').textContent).toBe('3')
    })
  })

  it('should advance slide on right arrow', async () => {
    const user = userEvent.setup()
    render(<TestDeck />)

    await user.keyboard('{ArrowRight}')
    expect(screen.getByTestId('current-slide').textContent).toBe('1')
  })

  it('should go back on left arrow', async () => {
    const user = userEvent.setup()
    render(<TestDeck />)

    await user.keyboard('{ArrowRight}')
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByTestId('current-slide').textContent).toBe('0')
  })

  it('should advance slide on space', async () => {
    const user = userEvent.setup()
    render(<TestDeck />)

    await user.keyboard(' ')
    expect(screen.getByTestId('current-slide').textContent).toBe('1')
  })

  it('should toggle light table on L key', async () => {
    const user = userEvent.setup()
    render(<TestDeck />)

    expect(screen.getByTestId('is-light-table').textContent).toBe('false')
    await user.keyboard('l')
    expect(screen.getByTestId('is-light-table').textContent).toBe('true')
    await user.keyboard('l')
    expect(screen.getByTestId('is-light-table').textContent).toBe('false')
  })

  it('should close light table on Escape', async () => {
    const user = userEvent.setup()
    render(<TestDeck />)

    await user.keyboard('l')
    expect(screen.getByTestId('is-light-table').textContent).toBe('true')
    await user.keyboard('{Escape}')
    expect(screen.getByTestId('is-light-table').textContent).toBe('false')
  })

  it('should register export API on window', () => {
    render(<TestDeck />)
    expect((window as Record<string, unknown>).slidenerds).toBeDefined()
  })

  it('should support interactive React components inside slides', async () => {
    const user = userEvent.setup()
    render(<InteractiveDeck />)

    const counter = screen.getByRole('button', { name: 'Demo count: 0' })
    await user.click(counter)
    expect(screen.getByRole('button', { name: 'Demo count: 1' })).toBeInTheDocument()
  })
})
