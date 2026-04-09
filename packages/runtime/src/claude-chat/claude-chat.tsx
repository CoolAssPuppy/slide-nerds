'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toCssLength, useSlideActiveReplay } from '../slide-replay.js'
import type { ClaudeChatProps, ChatMessage, ChatTool } from './types.js'

const DEFAULT_HEIGHT = 480
const DEFAULT_START_DELAY = 600
const DEFAULT_MESSAGE_DELAY = 1200

const ClaudeAvatar: React.FC = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 32 32"
    aria-hidden="true"
    style={{ flexShrink: 0 }}
  >
    <g fill="#D97706">
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 360) / 8
        return (
          <rect
            key={i}
            x="15"
            y="3"
            width="2"
            height="10"
            rx="1"
            transform={`rotate(${angle} 16 16)`}
          />
        )
      })}
    </g>
  </svg>
)

const ThinkingDots: React.FC = () => (
  <span
    aria-label="Claude is thinking"
    style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}
  >
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#D97706',
          opacity: 0.6,
          animation: `claude-chat-pulse 1.2s ease-in-out ${i * 0.18}s infinite`,
        }}
      />
    ))}
  </span>
)

const statusColor = (status: ChatTool['status']): string => {
  switch (status) {
    case 'running':
      return '#D97706'
    case 'done':
      return '#22c55e'
    case 'error':
      return '#ef4444'
    case 'pending':
    default:
      return 'rgba(60, 50, 40, 0.4)'
  }
}

const ToolRow: React.FC<{ tool: ChatTool }> = ({ tool }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.55rem',
      fontSize: '0.78rem',
      padding: '0.35rem 0.6rem',
      background: 'rgba(217, 119, 6, 0.06)',
      border: '1px solid rgba(217, 119, 6, 0.14)',
      borderRadius: '8px',
      color: 'rgba(60, 50, 40, 0.78)',
      fontFamily: 'var(--font-mono, ui-monospace, monospace)',
    }}
  >
    <span
      style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: statusColor(tool.status),
      }}
    />
    <span style={{ fontWeight: 500 }}>{tool.name}</span>
    {tool.detail && <span style={{ opacity: 0.55 }}>· {tool.detail}</span>}
  </div>
)

const UserBubble: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      alignSelf: 'flex-end',
      maxWidth: '78%',
      background: '#efe9dd',
      color: '#2b241a',
      padding: '0.85rem 1.1rem',
      borderRadius: '18px 18px 4px 18px',
      fontSize: '0.95rem',
      lineHeight: 1.45,
    }}
  >
    {text}
  </div>
)

const AssistantMessage: React.FC<{ message: ChatMessage }> = ({ message }) => (
  <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
    <ClaudeAvatar />
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
        color: '#2b241a',
        fontSize: '0.95rem',
        lineHeight: 1.55,
        flex: 1,
      }}
    >
      {message.thinking ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'rgba(60, 50, 40, 0.68)',
            fontStyle: 'italic',
          }}
        >
          <ThinkingDots />
          {message.text}
        </div>
      ) : (
        <div>{message.text}</div>
      )}
      {message.tools && message.tools.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {message.tools.map((tool, i) => (
            <ToolRow key={i} tool={tool} />
          ))}
        </div>
      )}
      {message.artifact && (
        <div
          style={{
            marginTop: '0.35rem',
            alignSelf: 'flex-start',
            padding: '0.65rem 0.9rem',
            background: '#ffffff',
            border: '1px solid rgba(60, 50, 40, 0.12)',
            borderRadius: '10px',
            fontSize: '0.8rem',
            color: '#2b241a',
            boxShadow: '0 1px 2px rgba(60, 50, 40, 0.06)',
          }}
        >
          <span style={{ opacity: 0.55, marginRight: '0.5rem' }}>
            {message.artifact.kind ?? 'document'}
          </span>
          {message.artifact.title}
        </div>
      )}
    </div>
  </div>
)

export const ClaudeChat: React.FC<ClaudeChatProps> = ({
  title = 'New chat',
  model = 'claude-sonnet-4-6',
  messages,
  height = DEFAULT_HEIGHT,
  autoScroll = true,
  scrollSpeed = 'natural',
  startDelay = DEFAULT_START_DELAY,
  messageDelay = DEFAULT_MESSAGE_DELAY,
  className,
  style,
}) => {
  const [visibleCount, setVisibleCount] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startPlayback = useCallback(() => {
    clearTimer()
    setVisibleCount(0)
    const reveal = (index: number) => {
      setVisibleCount(index)
      if (index < messages.length) {
        timerRef.current = setTimeout(() => reveal(index + 1), messageDelay)
      }
    }
    if (messages.length === 0) return
    timerRef.current = setTimeout(() => reveal(1), startDelay)
  }, [messages, messageDelay, startDelay, clearTimer])

  const showAll = useCallback(() => {
    clearTimer()
    setVisibleCount(messages.length)
  }, [messages.length, clearTimer])

  useSlideActiveReplay({
    ref: containerRef,
    onActive: startPlayback,
    onStandalone: showAll,
    onCleanup: clearTimer,
    deps: [startPlayback, showAll, clearTimer],
  })

  useEffect(() => {
    if (!autoScroll) return
    const el = scrollRef.current
    if (!el) return
    if (typeof el.scrollTo === 'function') {
      const behavior: ScrollBehavior = scrollSpeed === 'instant' ? 'auto' : 'smooth'
      el.scrollTo({ top: el.scrollHeight, behavior })
    } else {
      el.scrollTop = el.scrollHeight
    }
  }, [visibleCount, autoScroll, scrollSpeed])

  const visibleMessages = messages.slice(0, visibleCount)

  return (
    <div
      ref={containerRef}
      className={className}
      data-testid="claude-chat"
      style={{
        width: '100%',
        maxWidth: '720px',
        background: '#fafaf7',
        borderRadius: '18px',
        border: '1px solid rgba(60, 50, 40, 0.1)',
        boxShadow: '0 18px 48px -18px rgba(60, 50, 40, 0.32)',
        overflow: 'hidden',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
        ...style,
      }}
    >
      <style>{`
        @keyframes claude-chat-pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.85); }
          50% { opacity: 0.9; transform: scale(1); }
        }
        @keyframes claude-chat-enter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.1rem',
          borderBottom: '1px solid rgba(60, 50, 40, 0.08)',
          background: '#f3efe6',
        }}
      >
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2b241a' }}>
          {title}
        </div>
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: 500,
            color: '#8a7a62',
            padding: '0.3rem 0.7rem',
            background: 'rgba(217, 119, 6, 0.1)',
            borderRadius: '999px',
            letterSpacing: '0.02em',
          }}
        >
          {model}
        </div>
      </div>
      <div
        ref={scrollRef}
        style={{
          height: toCssLength(height),
          overflowY: 'auto',
          padding: '1.5rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.35rem',
          scrollBehavior: scrollSpeed === 'instant' ? 'auto' : 'smooth',
        }}
      >
        {visibleMessages.map((message, i) => (
          <div
            key={i}
            style={{
              animation: 'claude-chat-enter 360ms ease both',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {message.role === 'user' ? (
              <UserBubble text={message.text} />
            ) : (
              <AssistantMessage message={message} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
