'use client'

import React, { useCallback, useState } from 'react'
import { useSlideState } from './slide-context'

type ControlItem = {
  label: string
  icon: React.ReactNode
  action: () => void
}

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const PresenterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
)

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
)

const FullscreenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
)

const SHORTCUTS = [
  { key: 'Space / \u2192', label: 'Next step or slide' },
  { key: '\u2190 / Backspace', label: 'Previous step or slide' },
  { key: 'P', label: 'Speaker Notes' },
  { key: 'L', label: 'Light Table' },
  { key: 'F', label: 'Fullscreen' },
  { key: 'Esc', label: 'Exit Light Table / fullscreen' },
  { key: 'Double-click', label: 'Previous slide' },
] as const

const HelpTray: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 10000,
      minWidth: '280px',
      padding: '16px 20px',
      borderRadius: '14px',
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}
  >
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    }}>
      <span style={{
        fontSize: '11px',
        fontWeight: 700,
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
      }}>
        Keyboard shortcuts
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.4)',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          fontSize: '16px',
          lineHeight: 1,
        }}
        aria-label="Close help"
      >
        &times;
      </button>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {SHORTCUTS.map((s) => (
        <div key={s.key} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}>
          <span style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}>
            {s.label}
          </span>
          <kbd style={{
            fontSize: '11px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.8)',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            whiteSpace: 'nowrap' as const,
          }}>
            {s.key}
          </kbd>
        </div>
      ))}
    </div>
  </div>
)

export const SlideControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const state = useSlideState()

  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  const handleHelp = useCallback(() => {
    setIsOpen(false)
    setShowHelp(true)
  }, [])

  const handlePresenter = useCallback(() => {
    setIsOpen(false)
    const event = new KeyboardEvent('keydown', { key: 'p' })
    window.dispatchEvent(event)
  }, [])

  const handleLightTable = useCallback(() => {
    setIsOpen(false)
    state.toggleLightTable()
  }, [state.toggleLightTable])

  const handleFullscreen = useCallback(() => {
    setIsOpen(false)
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    } else {
      document.documentElement.requestFullscreen?.()
    }
  }, [])

  const items: ReadonlyArray<ControlItem> = [
    { label: 'Help', icon: <HelpIcon />, action: handleHelp },
    { label: 'Speaker Notes', icon: <PresenterIcon />, action: handlePresenter },
    { label: 'Light Table', icon: <GridIcon />, action: handleLightTable },
    { label: 'Fullscreen', icon: <FullscreenIcon />, action: handleFullscreen },
  ]

  const slideLabel = `${state.currentSlide + 1} / ${state.totalSlides}`

  return (
    <>
      {showHelp && <HelpTray onClose={() => setShowHelp(false)} />}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {isOpen && !showHelp && (
          <div
            style={{
              position: 'absolute',
              bottom: '56px',
              right: '0',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: '170px',
              padding: '6px',
              borderRadius: '12px',
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.4)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
              }}
            >
              Slide {slideLabel}
            </div>
            {items.map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.85)',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                  width: '100%',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span style={{ opacity: 0.7, display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={toggle}
          aria-label="Slide controls"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: isOpen ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isOpen
              ? 'rgba(255, 255, 255, 0.15)'
              : 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="6" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="18" r="2" />
          </svg>
        </button>
      </div>
    </>
  )
}
