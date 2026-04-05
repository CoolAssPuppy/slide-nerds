import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error(
    'Missing STRIPE_SECRET_KEY environment variable. ' +
    'See docs/STRIPE-SETUP.md for configuration instructions.'
  )
}

export const stripe = new Stripe(stripeSecretKey)
