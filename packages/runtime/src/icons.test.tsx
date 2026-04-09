import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Icon, McpLogo, BotIcon, type IconComponent } from './icons'

const StubIcon: IconComponent = ({ size, strokeWidth, color, className }) => (
  <svg
    data-testid="stub-icon"
    data-size={String(size)}
    data-stroke={String(strokeWidth)}
    data-color={color}
    className={className}
  />
)

describe('Icon wrapper', () => {
  it('should pass slide-appropriate defaults to the underlying icon', () => {
    render(<Icon as={StubIcon} />)
    const svg = screen.getByTestId('stub-icon')
    expect(svg.getAttribute('data-size')).toBe('20')
    expect(svg.getAttribute('data-stroke')).toBe('1.75')
    expect(svg.getAttribute('data-color')).toBe('currentColor')
  })

  it('should forward overrides to the underlying icon', () => {
    render(<Icon as={StubIcon} size={48} strokeWidth={1.5} color="#f59e0b" />)
    const svg = screen.getByTestId('stub-icon')
    expect(svg.getAttribute('data-size')).toBe('48')
    expect(svg.getAttribute('data-stroke')).toBe('1.5')
    expect(svg.getAttribute('data-color')).toBe('#f59e0b')
  })

  it('should announce a label when provided', () => {
    render(<Icon as={StubIcon} label="Goal" />)
    expect(screen.getByRole('img', { name: 'Goal' })).toBeInTheDocument()
  })
})

describe('McpLogo', () => {
  it('should render with a default accessible label', () => {
    render(<McpLogo />)
    expect(
      screen.getByRole('img', { name: 'Model Context Protocol' }),
    ).toBeInTheDocument()
  })
})

describe('BotIcon', () => {
  it('should render with a default accessible label', () => {
    render(<BotIcon />)
    expect(screen.getByRole('img', { name: 'Bot' })).toBeInTheDocument()
  })
})
