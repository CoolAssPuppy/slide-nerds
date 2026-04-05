'use client'

import { useCallback, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('slidenerds-theme') as Theme | null
    if (stored) {
      setTheme(stored)
      applyTheme(stored)
    }
  }, [])

  const applyTheme = (t: Theme) => {
    const root = document.documentElement
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('light', !prefersDark)
    } else {
      root.classList.toggle('light', t === 'light')
    }
  }

  const cycle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
    setTheme(next)
    localStorage.setItem('slidenerds-theme', next)
    applyTheme(next)
  }, [theme])

  const icon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻'

  return (
    <button
      onClick={cycle}
      className="w-8 h-8 flex items-center justify-center rounded-[var(--n-radius-md)] hover:bg-[var(--accent)] transition-colors text-sm"
      title={`Theme: ${theme}`}
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      {icon}
    </button>
  )
}
