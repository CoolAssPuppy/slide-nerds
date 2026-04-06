import Link from 'next/link'
import { PricingButton } from '@/components/billing/PricingButton'
import type { Plan } from '@/lib/stripe/config'

const PLANS = [
  {
    name: 'Open Source' as const,
    plan: null,
    price: 'Free',
    period: 'forever',
    features: [
      'Create decks locally',
      'Full runtime + 19 skills',
      'Presenter mode + Light Table',
      'Embed any React component',
      'CLI export to PDF and PPTX',
      'No account required',
    ],
    highlighted: false,
  },
  {
    name: 'Free' as const,
    plan: 'free' as Plan,
    price: '$0',
    period: 'limited time',
    features: [
      'Unlimited public decks',
      'Public sharing only',
      'Unlimited exports',
      'Basic analytics',
    ],
    highlighted: false,
  },
  {
    name: 'Pro' as const,
    plan: 'pro' as Plan,
    price: '$4',
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
    price: '$9',
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

type PricingSectionProps = {
  currentPlan: Plan
  isAuthenticated: boolean
}

export function PricingSection({ currentPlan, isAuthenticated }: PricingSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            {plan.plan ? (
              <PricingButton
                plan={plan.plan}
                currentPlan={currentPlan}
                isAuthenticated={isAuthenticated}
                isHighlighted={plan.highlighted}
              />
            ) : (
              <a
                href="https://www.npmjs.com/package/@strategicnerds/slide-nerds"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center py-2 rounded-[var(--n-radius-md)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)] transition-colors"
              >
                npm install
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
