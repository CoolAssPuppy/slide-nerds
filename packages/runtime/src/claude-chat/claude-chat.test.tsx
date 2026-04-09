import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ClaudeChat } from './claude-chat'
import type { ChatMessage } from './types'

const renderInsideActiveSlide = (children: React.ReactNode) => {
  const slide = document.createElement('section')
  slide.setAttribute('data-slide', '')
  slide.classList.add('active')
  document.body.appendChild(slide)
  return render(children, { container: slide })
}

const sampleMessages: ChatMessage[] = [
  { role: 'user', text: 'Plan a meetup tour.' },
  { role: 'assistant', text: 'Researching cities...', thinking: true },
  { role: 'assistant', text: 'Here are three options.' },
]

describe('ClaudeChat', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild)
    }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render the chat title and model badge', () => {
    renderInsideActiveSlide(
      <ClaudeChat
        title="Scoping a tour"
        model="claude-sonnet-4-6"
        messages={sampleMessages}
      />,
    )

    expect(screen.getByText('Scoping a tour')).toBeInTheDocument()
    expect(screen.getByText('claude-sonnet-4-6')).toBeInTheDocument()
  })

  it('should reveal messages over time with startDelay and messageDelay', () => {
    renderInsideActiveSlide(
      <ClaudeChat
        messages={sampleMessages}
        startDelay={500}
        messageDelay={1000}
      />,
    )

    expect(screen.queryByText('Plan a meetup tour.')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(screen.getByText('Plan a meetup tour.')).toBeInTheDocument()
    expect(screen.queryByText('Researching cities...')).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('Researching cities...')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('Here are three options.')).toBeInTheDocument()
  })

  it('should show all messages immediately when not inside a slide', () => {
    render(<ClaudeChat messages={sampleMessages} />)
    expect(screen.getByText('Plan a meetup tour.')).toBeInTheDocument()
    expect(screen.getByText('Here are three options.')).toBeInTheDocument()
  })
})
