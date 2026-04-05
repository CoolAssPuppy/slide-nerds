import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CopyCodeBlock } from '@/components/home/CopyCodeBlock'
import { TerminalBrowserDemo } from '@/components/home/TerminalBrowserDemo'
import { SlidePreviewPlayer } from '@/components/home/SlidePreviewPlayer'
import { FeatureGrid } from '@/components/home/FeatureGrid'
import { PricingSection } from '@/components/home/PricingSection'
import type { Subscription } from '@/lib/supabase/types'
import type { Plan } from '@/lib/stripe/config'

const INSTALL_CODE = `slidenerds create my-talk
cd my-talk
npm install
npm run dev`

const SHARE_CODE = `slidenerds login
slidenerds link --name my-talk
slidenerds push`

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan: Plan = 'free'
  if (user) {
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single()
    const sub = subData as Pick<Subscription, 'plan'> | null
    currentPlan = (sub?.plan ?? 'free') as Plan
  }

  const isAuthenticated = Boolean(user)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between h-14 px-6 border-b border-[var(--border)]">
        <span className="text-lg font-bold text-[var(--foreground)]">SlideNerds</span>
        <nav className="flex items-center gap-4">
          <Link href="/docs" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            Docs
          </Link>
          <Link href="/login" className="text-sm font-medium px-4 py-1.5 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)]">
            Sign in
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="flex flex-col items-center text-center pt-20 pb-16 px-6">
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
          <div className="mt-16 w-full max-w-2xl">
            <CopyCodeBlock code={INSTALL_CODE} />
          </div>
        </section>

        {/* Section 1: Build */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold tracking-tight">Build slides like you build code</h2>
              <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                Use your favorite LLM to generate gorgeous decks. The open-source package works locally with zero cost.
              </p>
            </div>
            <TerminalBrowserDemo />
          </div>
        </section>

        {/* Section 2: Share */}
        <section className="py-24 px-6 bg-[var(--muted)]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold tracking-tight">Share slides with SlideNerds</h2>
              <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                Host your slides on our service, share them with colleagues, customers, and partners, and get analytics on what people read.
              </p>
              <div className="mt-6 flex justify-center">
                <div className="w-full max-w-2xl">
                  <CopyCodeBlock code={SHARE_CODE} />
                </div>
              </div>
            </div>
            <div className="max-w-4xl mx-auto">
              <SlidePreviewPlayer variant="analytics" />
            </div>
          </div>
        </section>

        {/* Section 3: Pricing */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold tracking-tight">Pricing for teams of all sizes</h2>
              <p className="mt-4 text-lg text-[var(--muted-foreground)]">
                Free for individuals, Pro for professionals, Team for organizations
              </p>
            </div>
            <PricingSection currentPlan={currentPlan} isAuthenticated={isAuthenticated} />
          </div>
        </section>

        {/* Section 4: Features */}
        <section className="py-24 px-6 bg-[var(--muted)]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold tracking-tight">Everything you need</h2>
              <p className="mt-4 text-lg text-[var(--muted-foreground)]">
                From creation to presentation, every feature built for developers who care about their slides.
              </p>
            </div>
            <FeatureGrid />
          </div>
        </section>

        {/* Section 5: CTA */}
        <section className="py-24 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold tracking-tight">Start building today</h2>
            <p className="mt-4 text-lg text-[var(--muted-foreground)]">
              Install the package, fire up your LLM, and have a deck ready in minutes.
            </p>
            <div className="mt-10">
              <Link
                href="/signup"
                className="px-8 py-3 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get started free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-8 px-6 text-center text-sm text-[var(--muted-foreground)]">
        Built by Strategic Nerds. Open source on GitHub.
      </footer>
    </div>
  )
}
