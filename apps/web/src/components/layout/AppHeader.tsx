'use client'

import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from './ThemeToggle'

type AppHeaderProps = {
  user: User
  displayName?: string
  avatarUrl?: string
}

export function AppHeader({ user, displayName, avatarUrl }: AppHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
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
        <ThemeToggle />

        <div className="flex items-center gap-2">
          <Link href="/profile" className="flex items-center gap-2 group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName || 'Avatar'}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
            )}
            <span className="hidden sm:block text-sm text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
              {displayName || user.email}
            </span>
          </Link>
        </div>

        <button
          onClick={handleSignOut}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors px-2 py-1"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
