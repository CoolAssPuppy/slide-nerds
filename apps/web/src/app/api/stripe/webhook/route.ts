import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const _body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // TODO: Verify Stripe webhook signature and process events
  // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  // Handle: checkout.session.completed, customer.subscription.updated, etc.

  return NextResponse.json({ received: true })
}
