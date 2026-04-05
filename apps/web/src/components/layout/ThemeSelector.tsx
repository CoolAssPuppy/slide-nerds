'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { THEMES, type ThemeId } from '@/lib/themes'

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [expanded, setExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <div
        className="flex flex-row-reverse items-center overflow-hidden rounded-full"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          gap: expanded ? '6px' : '0px',
          padding: expanded ? '4px 8px' : '4px',
          transition: 'gap 300ms cubic-bezier(0.34, 1.56, 0.64, 1), padding 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseEnter={() => {
          if (collapseTimer.current) clearTimeout(collapseTimer.current)
          setExpanded(true)
        }}
        onMouseLeave={() => {
          collapseTimer.current = setTimeout(() => setExpanded(false), 600)
        }}
      >
        {THEMES.map((th) => {
          const isActive = theme === th.id
          const show = expanded || isActive
          return (
            <button
              key={th.id}
              onClick={() => {
                setTheme(th.id as ThemeId)
                setExpanded(false)
              }}
              className="rounded-full shrink-0 hover:brightness-110"
              style={{
                backgroundColor: th.dot,
                width: show ? '16px' : '0px',
                height: '16px',
                opacity: show ? 1 : 0,
                boxShadow: isActive
                  ? '0 0 0 2px var(--background), 0 0 0 3.5px var(--foreground)'
                  : 'none',
                transition: 'width 300ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
              }}
              aria-label={th.label}
              title={th.label}
            />
          )
        })}
      </div>
    </div>
  )
}
