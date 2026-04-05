import Link from 'next/link'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between h-14 px-6 border-b border-[var(--border)]">
        <Link href="/" className="text-lg font-bold text-[var(--primary)]">
          SlideNerds
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Pricing
          </Link>
          <Link href="/docs" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Docs
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium px-4 py-1.5 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            Sign in
          </Link>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--border)] py-8 px-6 text-center text-sm text-[var(--muted-foreground)]">
        Built by Strategic Nerds. Open source on GitHub.
      </footer>
    </div>
  )
}
