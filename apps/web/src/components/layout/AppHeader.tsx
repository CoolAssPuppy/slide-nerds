'use client'

import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

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
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const firstName = displayName?.split(' ')[0] || user.email?.split('@')[0] || 'friend'

  const greeting = useMemo(() => {
    const idx = Math.floor(Math.random() * GREETINGS.length)
    return GREETINGS[idx]
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setShowDropdown(false)
    await supabase.auth.signOut()
    router.push('/login')
  }

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

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="hover:opacity-80 transition-opacity"
          >
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
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-12 w-48 rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--popover)] shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-[var(--border)]">
                <p className="text-sm font-medium truncate">{displayName || 'User'}</p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">{user.email}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--accent)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </Link>
              <div className="border-t border-[var(--border)] my-1" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--accent)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
