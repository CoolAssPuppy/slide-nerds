'use client'

import { useState } from 'react'
import type { Plan } from '@/lib/stripe/config'

type SubscriptionManagerProps = {
  currentPlan: Plan
  status: string
  hasStripeCustomer: boolean
}

const PLAN_ORDER: Plan[] = ['free', 'pro', 'team']
const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
}
const PLAN_PRICES: Record<Plan, string> = {
  free: '$0/month',
  pro: '$12/month',
  team: '$29/seat/month',
}

export function SubscriptionManager({
  currentPlan,
  status,
  hasStripeCustomer,
}: SubscriptionManagerProps) {
  const [loading, setLoading] = useState<Plan | 'portal' | null>(null)

  const handleCheckout = async (plan: Plan) => {
    setLoading(plan)
    try {
      const resp = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { url } = await resp.json()
      if (url) window.location.href = url
    } finally {
      setLoading(null)
    }
  }

  const handlePortal = async () => {
    setLoading('portal')
    try {
      const resp = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await resp.json()
      if (url) window.location.href = url
    } finally {
      setLoading(null)
    }
  }

  const currentIndex = PLAN_ORDER.indexOf(currentPlan)
  const btnClass =
    'px-4 h-9 rounded-[var(--n-radius-md)] text-sm font-medium transition-opacity disabled:opacity-50'

  return (
    <div className="space-y-4">
      {status === 'past_due' && (
        <div className="rounded-[var(--n-radius-md)] border border-[var(--destructive)] bg-[var(--destructive)]/10 p-3 text-sm text-[var(--destructive)]">
          Your payment failed. Please update your payment method to keep your plan active.
        </div>
      )}

      {status === 'canceled' && currentPlan !== 'free' && (
        <div className="rounded-[var(--n-radius-md)] border border-[var(--border)] bg-[var(--muted)] p-3 text-sm text-[var(--muted-foreground)]">
          Your subscription has been canceled. You can resubscribe below.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {PLAN_ORDER.map((plan, index) => {
          const isCurrent = plan === currentPlan && status === 'active'
          const isUpgrade = index > currentIndex
          const isDowngrade = index < currentIndex

          return (
            <div
              key={plan}
              className={`rounded-[var(--n-radius-md)] border p-4 text-center ${
                isCurrent
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                  : 'border-[var(--border)]'
              }`}
            >
              <div className="text-sm font-semibold">{PLAN_LABELS[plan]}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-1">{PLAN_PRICES[plan]}</div>
              <div className="mt-3">
                {isCurrent && (
                  <span className="text-xs text-[var(--primary)] font-medium">Current plan</span>
                )}
                {isUpgrade && plan !== 'free' && (
                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={loading !== null}
                    className={`${btnClass} bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90`}
                  >
                    {loading === plan ? 'Loading...' : 'Upgrade'}
                  </button>
                )}
                {isDowngrade && hasStripeCustomer && (
                  <button
                    onClick={handlePortal}
                    disabled={loading !== null}
                    className={`${btnClass} border border-[var(--border)] hover:bg-[var(--accent)]`}
                  >
                    {loading === 'portal' ? 'Loading...' : 'Downgrade'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {hasStripeCustomer && (
        <button
          onClick={handlePortal}
          disabled={loading !== null}
          className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline underline-offset-2"
        >
          {loading === 'portal' ? 'Opening...' : 'Manage billing and invoices'}
        </button>
      )}
    </div>
  )
}
