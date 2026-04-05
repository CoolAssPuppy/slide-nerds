'use client'

import { createContext, useState, useCallback, useContext, useEffect, type ReactNode } from 'react'
import { type ThemeId, getThemeById } from '@/lib/themes'

type ThemeContextValue = {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'snow',
  setTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function applyTheme(id: ThemeId) {
  const theme = getThemeById(id)
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.variables)) {
    root.style.setProperty(key, value)
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('snow')

  useEffect(() => {
    const saved = localStorage.getItem('slidenerds-theme') as ThemeId | null
    if (saved) {
      setThemeState(saved)
      applyTheme(saved)
    }
  }, [])

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id)
    localStorage.setItem('slidenerds-theme', id)
    applyTheme(id)
  }, [])

  return (
    <ThemeContext value={{ theme, setTheme }}>
      {children}
    </ThemeContext>
  )
}
