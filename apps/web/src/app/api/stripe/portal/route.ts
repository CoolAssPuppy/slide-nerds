import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: Create Stripe billing portal session
  // const { data: subscription } = await supabase.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single()
  // const session = await stripe.billingPortal.sessions.create({
  //   customer: subscription.stripe_customer_id,
  //   return_url: `${origin}/profile`,
  // })

  return NextResponse.json({
    url: '/profile?message=stripe-not-configured',
  })
}
