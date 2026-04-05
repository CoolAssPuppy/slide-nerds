import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import { LivePoll } from './LivePoll'
import { LiveReactions } from './LiveReactions'
import { LiveQA } from './LiveQA'
import { LiveAudienceCount } from './LiveAudienceCount'
import { LiveWordCloud } from './LiveWordCloud'

const mockFetch = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([]),
    status: 200,
  })

  Object.defineProperty(window, 'location', {
    value: { search: '?session=test-session-1', href: 'http://localhost' },
    writable: true,
  })

  Storage.prototype.getItem = vi.fn().mockReturnValue('voter-123')
  Storage.prototype.setItem = vi.fn()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('LivePoll', () => {
  it('should render question and options when no session ID prop is needed (reads from URL)', () => {
    render(
      <LivePoll
        question="What is your favorite framework?"
        options={['React', 'Vue', 'Angular']}
        serviceUrl="http://localhost:3000"
      />,
    )

    expect(screen.getByText('What is your favorite framework?')).toBeTruthy()
    expect(screen.getByText('React')).toBeTruthy()
    expect(screen.getByText('Vue')).toBeTruthy()
    expect(screen.getByText('Angular')).toBeTruthy()
  })

  it('should show "no live session" when session ID unavailable', () => {
    Object.defineProperty(window, 'location', {
      value: { search: '', href: 'http://localhost' },
      writable: true,
    })

    render(
      <LivePoll
        question="Test?"
        options={['A', 'B']}
        serviceUrl="http://localhost:3000"
      />,
    )

    expect(screen.getByText('No live session active')).toBeTruthy()
  })

  it('should poll for results', async () => {
    const mockResults = [
      {
        id: 'poll-1',
        question: 'Favorite?',
        total_votes: 5,
        is_active: true,
        slide_index: 0,
        options: [
          { label: 'React', index: 0, votes: 3 },
          { label: 'Vue', index: 1, votes: 2 },
        ],
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
      status: 200,
    })

    render(
      <LivePoll
        question="Favorite?"
        options={['React', 'Vue']}
        serviceUrl="http://localhost:3000"
      />,
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/live/test-session-1/poll/results',
      )
    })
  })
})

describe('LiveReactions', () => {
  it('should render five reaction buttons', () => {
    render(<LiveReactions serviceUrl="http://localhost:3000" />)

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)
  })

  it('should send reaction on click', async () => {
    const user = userEvent.setup()

    render(<LiveReactions serviceUrl="http://localhost:3000" />)

    const thumbsUpButton = screen.getByLabelText('React with thumbsup')
    await user.click(thumbsUpButton)

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/live/test-session-1/react',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ type: 'thumbsup' }),
      }),
    )
  })

  it('should show "no live session" when no session', () => {
    Object.defineProperty(window, 'location', {
      value: { search: '', href: 'http://localhost' },
      writable: true,
    })

    render(<LiveReactions serviceUrl="http://localhost:3000" />)

    expect(screen.getByText('No live session active')).toBeTruthy()
  })
})

describe('LiveQA', () => {
  it('should render input form', () => {
    render(<LiveQA serviceUrl="http://localhost:3000" />)

    expect(screen.getByText('Ask a question')).toBeTruthy()
    expect(screen.getByPlaceholderText('Type your question...')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Send' })).toBeTruthy()
  })

  it('should submit a question', async () => {
    const user = userEvent.setup()
    mockFetch.mockImplementation((url: string, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: 'q-1', content: 'How?' }),
          status: 201,
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
        status: 200,
      })
    })

    render(<LiveQA serviceUrl="http://localhost:3000" />)

    const input = screen.getByPlaceholderText('Type your question...')
    await user.type(input, 'How does this work?')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/live/test-session-1/questions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ content: 'How does this work?' }),
      }),
    )
  })

  it('should display questions from polling', async () => {
    const questions = [
      {
        id: 'q-1',
        content: 'What about performance?',
        author_name: 'Alice',
        is_answered: false,
        slide_index: 0,
        created_at: '2026-01-01T00:00:00Z',
      },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(questions),
      status: 200,
    })

    render(<LiveQA serviceUrl="http://localhost:3000" />)

    await waitFor(() => {
      expect(screen.getByText('What about performance?')).toBeTruthy()
    })
  })

  it('should show empty state when no questions', async () => {
    render(<LiveQA serviceUrl="http://localhost:3000" />)

    await waitFor(() => {
      expect(screen.getByText('No questions yet. Be the first to ask.')).toBeTruthy()
    })
  })
})

describe('LiveAudienceCount', () => {
  it('should display audience count', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ count: 42, status: 'active' }),
      status: 200,
    })

    render(<LiveAudienceCount serviceUrl="http://localhost:3000" />)

    await waitFor(() => {
      expect(screen.getByText('42 watching')).toBeTruthy()
    })
  })

  it('should show "no live session" when no session', () => {
    Object.defineProperty(window, 'location', {
      value: { search: '', href: 'http://localhost' },
      writable: true,
    })

    render(<LiveAudienceCount serviceUrl="http://localhost:3000" />)

    expect(screen.getByText('No live session')).toBeTruthy()
  })

  it('should send join on mount', async () => {
    render(<LiveAudienceCount serviceUrl="http://localhost:3000" />)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/live/test-session-1/audience',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ action: 'join' }),
        }),
      )
    })
  })
})

describe('LiveWordCloud', () => {
  it('should render prompt and input', () => {
    render(
      <LiveWordCloud
        prompt="Describe this talk in one word"
        serviceUrl="http://localhost:3000"
      />,
    )

    expect(screen.getByText('Describe this talk in one word')).toBeTruthy()
    expect(screen.getByPlaceholderText('Enter a word or short phrase...')).toBeTruthy()
  })

  it('should submit a word and show submitted state', async () => {
    const user = userEvent.setup()
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
        status: 200,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
        status: 201,
      })

    render(
      <LiveWordCloud
        prompt="One word"
        serviceUrl="http://localhost:3000"
      />,
    )

    const input = screen.getByPlaceholderText('Enter a word or short phrase...')
    await user.type(input, 'excellent')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(screen.getByText('Response submitted')).toBeTruthy()
    })
  })

  it('should display word cloud from polling data', async () => {
    const words = [
      { word: 'react', count: 5 },
      { word: 'typescript', count: 3 },
    ]

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(words),
      status: 200,
    })

    render(
      <LiveWordCloud
        prompt="Favorite tech"
        serviceUrl="http://localhost:3000"
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('react')).toBeTruthy()
      expect(screen.getByText('typescript')).toBeTruthy()
    })
  })
})
