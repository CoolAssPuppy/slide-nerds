import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePresenterMode } from './use-presenter-mode'

class MockBroadcastChannel {
  name: string
  onmessage: ((event: MessageEvent) => void) | null = null
  static instances: MockBroadcastChannel[] = []
  closed = false

  constructor(name: string) {
    this.name = name
    MockBroadcastChannel.instances.push(this)
  }

  postMessage(data: unknown) {
    MockBroadcastChannel.instances
      .filter((ch) => ch !== this && ch.name === this.name && !ch.closed)
      .forEach((ch) => {
        ch.onmessage?.({ data } as MessageEvent)
      })
  }

  close() {
    this.closed = true
  }
}

describe('usePresenterMode', () => {
  beforeEach(() => {
    MockBroadcastChannel.instances = []
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should broadcast slide changes', () => {
    const onSlideChange = vi.fn()
    const onStepChange = vi.fn()

    renderHook(() =>
      usePresenterMode({
        currentSlide: 2,
        currentStep: 0,
        onSlideChange,
        onStepChange,
      }),
    )

    expect(MockBroadcastChannel.instances).toHaveLength(1)
    expect(MockBroadcastChannel.instances[0].name).toBe('slidenerds-presenter')
  })

  it('should receive slide change messages from other windows', () => {
    const onSlideChange = vi.fn()
    const onStepChange = vi.fn()

    renderHook(() =>
      usePresenterMode({
        currentSlide: 0,
        currentStep: 0,
        onSlideChange,
        onStepChange,
      }),
    )

    const externalChannel = new MockBroadcastChannel('slidenerds-presenter')
    externalChannel.postMessage({
      type: 'slide-change',
      slide: 5,
      step: 0,
    })

    expect(onSlideChange).toHaveBeenCalledWith(5)
  })

  it('should open presenter window with correct URL params', () => {
    const mockOpen = vi.fn().mockReturnValue({ close: vi.fn() })
    vi.stubGlobal('open', mockOpen)

    const { result } = renderHook(() =>
      usePresenterMode({
        currentSlide: 0,
        currentStep: 0,
        onSlideChange: vi.fn(),
        onStepChange: vi.fn(),
      }),
    )

    act(() => {
      result.current.openPresenterWindow()
    })

    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('presenter=true'),
      'slidenerds-presenter',
      'width=1024,height=768',
    )
  })

  it('should close presenter window', () => {
    const mockClose = vi.fn()
    const mockOpen = vi.fn().mockReturnValue({ close: mockClose })
    vi.stubGlobal('open', mockOpen)

    const { result } = renderHook(() =>
      usePresenterMode({
        currentSlide: 0,
        currentStep: 0,
        onSlideChange: vi.fn(),
        onStepChange: vi.fn(),
      }),
    )

    act(() => {
      result.current.openPresenterWindow()
    })

    act(() => {
      result.current.closePresenterWindow()
    })

    expect(mockClose).toHaveBeenCalled()
  })

  it('should clean up channel on unmount', () => {
    const { unmount } = renderHook(() =>
      usePresenterMode({
        currentSlide: 0,
        currentStep: 0,
        onSlideChange: vi.fn(),
        onStepChange: vi.fn(),
      }),
    )

    const channel = MockBroadcastChannel.instances[0]
    expect(channel.closed).toBe(false)

    unmount()

    expect(channel.closed).toBe(true)
  })
})
