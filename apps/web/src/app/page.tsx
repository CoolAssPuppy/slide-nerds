import Link from 'next/link'
import { CopyCodeBlock } from '@/components/home/CopyCodeBlock'
import { TerminalBrowserDemo } from '@/components/home/TerminalBrowserDemo'

const INSTALL_CODE = `npx @strategicnerds/slide-nerds create my-talk
cd my-talk
npm install
npm run dev`

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between h-14 px-6 border-b border-[var(--border)]">
        <span className="text-lg font-bold text-[var(--primary)]">SlideNerds</span>
        <nav className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Pricing
          </Link>
          <Link href="/login" className="text-sm font-medium px-4 py-1.5 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)]">
            Sign in
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center px-6">
        <section className="flex flex-col items-center text-center pt-20 pb-12">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight max-w-3xl">
            Presentations are{' '}
            <span className="text-[var(--primary)]">code</span>
          </h1>
          <p className="mt-6 text-lg text-[var(--muted-foreground)] max-w-xl">
            Use Claude or Codex to build effective, compelling, and stunning presentations that communicate.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              href="/signup"
              className="px-6 py-2.5 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Get started free
            </Link>
            <a
              href="https://www.npmjs.com/package/@strategicnerds/slide-nerds"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-[var(--n-radius-md)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)] transition-colors"
            >
              npm install
            </a>
          </div>

          <div className="mt-16">
            <CopyCodeBlock code={INSTALL_CODE} />
          </div>
        </section>

        <section className="w-full py-16">
          <TerminalBrowserDemo />
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-8 px-6 text-center text-sm text-[var(--muted-foreground)]">
        Built by Strategic Nerds. Open source on GitHub.
      </footer>
    </div>
  )
}
