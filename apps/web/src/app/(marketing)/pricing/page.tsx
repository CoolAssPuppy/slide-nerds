import Link from 'next/link'

export const metadata = { title: 'Pricing' }

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      '3 hosted decks',
      'Public sharing only',
      '5 exports per month',
      'Basic analytics',
    ],
    cta: 'Get started',
    href: '/signup',
    highlighted: false,
  },
  {
    name: 'Pro',
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
    cta: 'Start free trial',
    href: '/signup',
    highlighted: true,
  },
  {
    name: 'Team',
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
    cta: 'Contact us',
    href: '/signup',
    highlighted: false,
  },
] as const

export default function PricingPage() {
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
            <Link
              href={plan.href}
              className={`mt-6 block text-center py-2.5 rounded-[var(--n-radius-md)] text-sm font-medium transition-opacity ${
                plan.highlighted
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
                  : 'border border-[var(--border)] hover:bg-[var(--accent)]'
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
