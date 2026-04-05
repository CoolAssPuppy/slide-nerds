import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { checkoutRequestSchema, PLAN_PRICE_MAP } from '@/lib/stripe/config'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = checkoutRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid plan. Must be "pro" or "team".' },
      { status: 400 }
    )
  }

  const { plan } = parsed.data
  const priceId = PLAN_PRICE_MAP[plan]

  if (!priceId) {
    return NextResponse.json(
      { error: 'Stripe price not configured for this plan.' },
      { status: 500 }
    )
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || ''

  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/slides?checkout=success`,
    cancel_url: `${origin}/pricing`,
    subscription_data: {
      metadata: { user_id: user.id, plan },
    },
    metadata: { user_id: user.id, plan },
  }

  if (subscription?.stripe_customer_id) {
    sessionParams.customer = subscription.stripe_customer_id
  } else {
    sessionParams.customer_email = user.email
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  return NextResponse.json({ url: session.url })
}
