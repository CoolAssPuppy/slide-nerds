import { z } from 'zod'

export const PLAN_NAMES = ['free', 'pro', 'team'] as const
export type Plan = (typeof PLAN_NAMES)[number]

export const SUBSCRIPTION_STATUSES = ['active', 'canceled', 'past_due', 'trialing'] as const
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number]

export const checkoutRequestSchema = z.object({
  plan: z.enum(['pro', 'team']),
})

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>

const PRICE_PRO = process.env.STRIPE_PRICE_PRO_MONTHLY ?? ''
const PRICE_TEAM = process.env.STRIPE_PRICE_TEAM_MONTHLY ?? ''

export const PLAN_PRICE_MAP: Record<Exclude<Plan, 'free'>, string> = {
  pro: PRICE_PRO,
  team: PRICE_TEAM,
}

const PRICE_TO_PLAN_MAP = new Map<string, Plan>()

export function buildPriceToPlanMap(): void {
  if (PRICE_PRO) PRICE_TO_PLAN_MAP.set(PRICE_PRO, 'pro')
  if (PRICE_TEAM) PRICE_TO_PLAN_MAP.set(PRICE_TEAM, 'team')
}

buildPriceToPlanMap()

export function stripePriceToPlan(priceId: string): Plan {
  const plan = PRICE_TO_PLAN_MAP.get(priceId)
  if (!plan) {
    throw new Error(`Unknown Stripe price ID: ${priceId}`)
  }
  return plan
}

export function mapStripeStatus(stripeStatus: string): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
      return 'active'
    case 'trialing':
      return 'trialing'
    case 'canceled':
    case 'unpaid':
      return 'canceled'
    case 'past_due':
    case 'incomplete':
    case 'incomplete_expired':
    case 'paused':
      return 'past_due'
    default:
      return 'past_due'
  }
}

export const PLAN_DISPLAY_NAMES: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
}
