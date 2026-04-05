'use client'

import { useState, useEffect, useRef } from 'react'

type TypedTextProps = {
  text: string
  speed?: number
  delay?: number
  onComplete?: () => void
  className?: string
  showCursor?: boolean
}

export function TypedText({
  text,
  speed = 40,
  delay = 0,
  onComplete,
  className,
  showCursor = true,
}: TypedTextProps) {
  const [charIndex, setCharIndex] = useState(0)
  const [started, setStarted] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timeout)
  }, [delay])

  useEffect(() => {
    if (!started) return

    if (charIndex >= text.length) {
      onCompleteRef.current?.()
      return
    }

    const timeout = setTimeout(() => setCharIndex((i) => i + 1), speed)
    return () => clearTimeout(timeout)
  }, [started, charIndex, text.length, speed])

  if (!started) return null

  const isTyping = charIndex < text.length

  return (
    <span className={className}>
      {text.slice(0, charIndex)}
      {showCursor && isTyping && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  )
}
