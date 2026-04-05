import { createClient } from '@/lib/supabase/server'
import { PricingButton } from '@/components/billing/PricingButton'
import type { Subscription } from '@/lib/supabase/types'
import type { Plan } from '@/lib/stripe/config'

export const metadata = { title: 'Pricing' }

const PLANS = [
  {
    name: 'Free' as const,
    plan: 'free' as Plan,
    price: '$0',
    period: 'forever',
    features: [
      '3 hosted decks',
      'Public sharing only',
      '5 exports per month',
      'Basic analytics',
    ],
    highlighted: false,
  },
  {
    name: 'Pro' as const,
    plan: 'pro' as Plan,
    price: '$12',
    period: 'per month',
    features: [
      'Unlimited decks',
      'Email and domain sharing',
      'Password-protected links',
      'Unlimited exports',
      'Full analytics',
      'Live presentations',
    ],
    highlighted: true,
  },
  {
    name: 'Team' as const,
    plan: 'team' as Plan,
    price: '$29',
    period: 'per seat / month',
    features: [
      'Everything in Pro',
      'Team workspace',
      'Shared brand configs',
      'Custom domain',
      'Priority export',
      'SSO (coming soon)',
    ],
    highlighted: false,
  },
] as const

export default async function PricingPage() {
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
    <div className="max-w-5xl mx-auto py-20 px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold">Simple pricing</h1>
        <p className="text-lg text-[var(--muted-foreground)] mt-4">
          The open-source package is free forever. Pay only for hosting, sharing, and export.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[var(--n-radius-xl)] border p-6 flex flex-col ${
              plan.highlighted
                ? 'border-[var(--primary)] bg-[var(--card)] relative'
                : 'border-[var(--border)] bg-[var(--card)]'
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary)] text-[var(--primary-foreground)]">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold">{plan.price}</span>
              <span className="text-sm text-[var(--muted-foreground)]">{plan.period}</span>
            </div>
            <ul className="mt-6 space-y-2 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <span className="text-[var(--primary)]">&#10003;</span>
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <PricingButton
                plan={plan.plan}
                currentPlan={currentPlan}
                isAuthenticated={isAuthenticated}
                isHighlighted={plan.highlighted}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
