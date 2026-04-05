'use client'

import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useMemo } from 'react'

const GREETINGS = [
  'Hey', 'Hi', 'Hello', 'Howdy', 'Yo', 'Sup', 'Ahoy',
  'Hola', 'Bonjour', 'Ciao', 'Aloha', 'Namaste', 'Salut',
  'G\'day', 'What\'s up', 'Welcome back', 'Good to see you',
  'Look who\'s here', 'Well hello there', 'Greetings',
  'Cheers', 'Top of the morning', 'Nice to see you',
  'Glad you\'re here', 'Ready to present', 'Let\'s build',
  'Back at it', 'Looking sharp', 'Hey there', 'What\'s good',
  'Bom dia', 'Hej', 'Moin', 'Oi', 'Servus',
] as const

type AppHeaderProps = {
  user: User
  displayName?: string
  avatarUrl?: string
}

export function AppHeader({ user, displayName, avatarUrl }: AppHeaderProps) {
  const firstName = displayName?.split(' ')[0] || user.email?.split('@')[0] || 'friend'

  const greeting = useMemo(() => {
    const idx = Math.floor(Math.random() * GREETINGS.length)
    return GREETINGS[idx]
  }, [])

  const initials = (displayName || user.email || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-[var(--border)] bg-[var(--card)]">
      <div className="lg:hidden">
        <Link href="/slides" className="text-lg font-bold text-[var(--primary)]">
          SlideNerds
        </Link>
      </div>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--muted-foreground)]">
          {greeting}, {firstName}
        </span>

        <Link href="/profile" className="hover:opacity-80 transition-opacity">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
          )}
        </Link>
      </div>
    </header>
  )
}
