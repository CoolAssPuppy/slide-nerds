import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClaudeCode } from './claude-code'
import type { ClaudeCodeLine } from './types'

const sampleSession: ClaudeCodeLine[] = [
  { kind: 'prompt', text: 'plan a 5-city meetup tour' },
  { kind: 'claude', text: "I'll scope a five-city tour." },
  { kind: 'tool', text: 'WebSearch("meetups Q2 2026")' },
  { kind: 'toolResult', text: '47 sources' },
  { kind: 'file', text: 'Wrote ./tours/candidates.md' },
  { kind: 'success', text: '✓ Done' },
]

describe('ClaudeCode', () => {
  beforeEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild)
    }
  })

  it('should render header traffic lights and the cwd/model line', () => {
    render(
      <ClaudeCode cwd="~/work/deck" model="claude-sonnet-4-6" session={sampleSession} />,
    )

    expect(screen.getByTestId('claude-code')).toBeInTheDocument()
    expect(screen.getByText(/claude · claude-sonnet-4-6/)).toBeInTheDocument()
  })

  it('should render all session lines when typewriter is off', () => {
    render(<ClaudeCode session={sampleSession} />)

    expect(screen.getByText(/plan a 5-city meetup tour/)).toBeInTheDocument()
    expect(screen.getByText(/I'll scope a five-city tour/)).toBeInTheDocument()
    expect(screen.getByText(/Wrote \.\/tours\/candidates\.md/)).toBeInTheDocument()
  })

  it('should include banner and welcome lines when enabled', () => {
    render(<ClaudeCode banner welcome session={sampleSession} />)

    expect(screen.getByText(/Welcome to Claude Code/)).toBeInTheDocument()
  })

  it('should render the input bar with cursor when showCursor is true', () => {
    const { container } = render(
      <ClaudeCode session={sampleSession} showCursor />,
    )
    expect(container.querySelector('[data-testid="claude-code"]')).not.toBeNull()
    expect(container.textContent).toContain('>')
  })
})
