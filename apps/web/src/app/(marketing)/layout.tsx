import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between h-14 px-6 border-b border-[var(--border)]">
        <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
          SlideNerds
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/docs" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Docs
          </Link>
          <Link
            href={user ? '/slides' : '/login'}
            className="text-sm font-medium px-4 py-1.5 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            {user ? 'Dashboard' : 'Sign in'}
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--border)] py-8 px-6 text-center text-sm text-[var(--muted-foreground)]">
        <p>Built with &#10084; by Strategic Nerds in Lisbon, Portugal</p>
        <p className="mt-2">
          <a
            href="https://www.strategicnerds.com/picksandshovels"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--foreground)] hover:underline"
          >
            Buy the definitive book on technical marketing
          </a>
        </p>
      </footer>
    </div>
  )
}
