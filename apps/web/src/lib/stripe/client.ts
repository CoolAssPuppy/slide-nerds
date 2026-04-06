import Stripe from 'stripe'

let _client: Stripe | null = null

function getStripeClient(): Stripe {
  if (!_client) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      throw new Error(
        'Missing STRIPE_SECRET_KEY environment variable. ' +
        'See docs/STRIPE-SETUP.md for configuration instructions.'
      )
    }

    _client = new Stripe(stripeSecretKey)
  }

  return _client
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripeClient()
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
