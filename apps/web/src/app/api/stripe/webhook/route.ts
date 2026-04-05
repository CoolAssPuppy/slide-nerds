import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { stripePriceToPlan, mapStripeStatus } from '@/lib/stripe/config'
import type Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.user_id
      const plan = session.metadata?.plan

      if (!userId || !plan) break

      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan,
          status: 'active',
        }, { onConflict: 'user_id' })

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.user_id

      if (!userId) break

      const priceId = subscription.items.data[0]?.price?.id
      const plan = priceId ? stripePriceToPlan(priceId) : undefined
      const status = mapStripeStatus(subscription.status)

      const currentPeriodEnd = subscription.items.data[0]?.current_period_end

      const updateData: Record<string, unknown> = {
        status,
        ...(currentPeriodEnd && {
          current_period_end: new Date(currentPeriodEnd * 1000).toISOString(),
        }),
      }

      if (plan) {
        updateData.plan = plan
      }

      await supabaseAdmin
        .from('subscriptions')
        .update(updateData)
        .eq('user_id', userId)

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.user_id

      if (!userId) break

      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'canceled', plan: 'free' })
        .eq('user_id', userId)

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_customer_id', customerId)

      break
    }
  }

  return NextResponse.json({ received: true })
}
