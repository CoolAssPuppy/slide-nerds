'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Presentation, User, Users, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/slides', label: 'Slides', icon: Presentation },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/team', label: 'Team', icon: Users },
] as const

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className="hidden lg:flex flex-col border-r border-[var(--border)] bg-[var(--card)]"
      style={{ width: 'var(--n-sidebar-width)' }}
    >
      <div className="p-4 border-b border-[var(--border)]">
        <Link href="/slides" className="flex items-center gap-2">
          <span className="text-lg font-bold text-[var(--primary)]">SlideNerds</span>
        </Link>
      </div>

      <nav className="flex-1 p-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-[var(--n-radius-md)] text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                  : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]'
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-2 border-t border-[var(--border)]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2 rounded-[var(--n-radius-md)] text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors w-full"
        >
          <LogOut size={18} className="shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
