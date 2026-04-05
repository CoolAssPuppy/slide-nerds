import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { plan: _plan } = body as { plan: 'pro' | 'team' }

  // TODO: Create Stripe checkout session
  // const session = await stripe.checkout.sessions.create({
  //   mode: 'subscription',
  //   customer_email: user.email,
  //   line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
  //   success_url: `${origin}/slides?checkout=success`,
  //   cancel_url: `${origin}/pricing`,
  // })

  return NextResponse.json({
    url: '/pricing?message=stripe-not-configured',
  })
}
