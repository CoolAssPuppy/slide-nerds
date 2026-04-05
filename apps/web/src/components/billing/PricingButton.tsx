'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Plan } from '@/lib/stripe/config'

type PricingButtonProps = {
  plan: Plan
  currentPlan: Plan
  isAuthenticated: boolean
  isHighlighted: boolean
}

export function PricingButton({
  plan,
  currentPlan,
  isAuthenticated,
  isHighlighted,
}: PricingButtonProps) {
  const [loading, setLoading] = useState(false)

  const isCurrent = plan === currentPlan

  const baseClass =
    'block w-full text-center py-2.5 rounded-[var(--n-radius-md)] text-sm font-medium transition-opacity'
  const highlightedClass = 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90'
  const defaultClass = 'border border-[var(--border)] hover:bg-[var(--accent)]'

  if (isCurrent) {
    return (
      <span className={`${baseClass} ${defaultClass} opacity-60 cursor-default`}>
        Current plan
      </span>
    )
  }

  if (!isAuthenticated) {
    return (
      <Link
        href="/signup"
        className={`${baseClass} ${isHighlighted ? highlightedClass : defaultClass}`}
      >
        Get started
      </Link>
    )
  }

  if (plan === 'free') {
    return (
      <Link
        href="/profile"
        className={`${baseClass} ${defaultClass}`}
      >
        Manage subscription
      </Link>
    )
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const { url } = await resp.json()
      if (url) window.location.href = url
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`${baseClass} ${isHighlighted ? highlightedClass : defaultClass} disabled:opacity-50`}
    >
      {loading ? 'Loading...' : 'Subscribe'}
    </button>
  )
}
