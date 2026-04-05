# Stripe setup

Step-by-step guide for configuring Stripe billing in the SlideNerds web app.

## 1. Create a Stripe account

Sign up at [stripe.com](https://stripe.com). For development, use test mode (toggle in the Stripe dashboard).

## 2. Create products and prices

In the Stripe dashboard, go to Product Catalog and create two products:

**Pro plan**
- Name: SlideNerds Pro
- Price: $12.00 / month (recurring)
- Copy the price ID (starts with `price_`)

**Team plan**
- Name: SlideNerds Team
- Price: $29.00 / month (recurring, per seat)
- Copy the price ID (starts with `price_`)

## 3. Configure the Customer Portal

Go to Settings > Billing > Customer Portal and enable:
- Invoice history
- Subscription cancellation
- Subscription plan changes (add both Pro and Team prices)
- Payment method updates

## 4. Set up the webhook endpoint

### Production

Go to Developers > Webhooks > Add endpoint:
- URL: `https://slidenerds.com/api/stripe/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Copy the signing secret (starts with `whsec_`)

### Local development

Install the Stripe CLI:

```bash
brew install stripe/stripe-cli/stripe
stripe login
```

Forward events to your local server:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI prints a webhook signing secret. Use that as `STRIPE_WEBHOOK_SECRET` in your local env.

## 5. Environment variables

Add these to your `.env.local` (or Vercel environment variables for production):

```
STRIPE_SECRET_KEY=sk_test_...          # From Stripe dashboard > Developers > API keys
STRIPE_WEBHOOK_SECRET=whsec_...        # From webhook endpoint or Stripe CLI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # From Stripe dashboard > Developers > API keys
STRIPE_PRICE_PRO_MONTHLY=price_...     # From the Pro product price
STRIPE_PRICE_TEAM_MONTHLY=price_...    # From the Team product price
SUPABASE_SERVICE_ROLE_KEY=eyJ...       # From Supabase dashboard > Settings > API
```

The `SUPABASE_SERVICE_ROLE_KEY` is needed for the webhook handler to write subscription data (bypassing RLS by design).

## 6. Architecture notes

### How subscriptions flow

1. User clicks "Subscribe" on the pricing page or profile
2. Frontend POSTs to `/api/stripe/checkout` with `{ plan: 'pro' | 'team' }`
3. Server creates a Stripe Checkout Session with `metadata.user_id` and `metadata.plan`
4. User completes payment on Stripe's hosted checkout page
5. Stripe fires `checkout.session.completed` webhook
6. Webhook handler upserts the `subscriptions` row with Stripe IDs, plan, and status
7. Subscription changes (upgrades, cancellations, failures) arrive via subsequent webhooks

### Security model

- The Stripe secret key is never exposed to the client
- Webhook events are verified using the signing secret
- Subscription writes happen only through the webhook (using the Supabase service role client)
- The user-facing Supabase client can only read their own subscription row (RLS SELECT policy)
- No client-side Stripe.js is loaded (checkout and portal use server-generated redirect URLs)

### Idempotency

Webhook handlers upsert by `user_id`, so duplicate or out-of-order events are handled gracefully.

## 7. Testing checklist

- [ ] Can subscribe to Pro from the pricing page
- [ ] Can subscribe to Team from the pricing page
- [ ] Checkout redirects to Stripe, then back to `/slides?checkout=success`
- [ ] Webhook creates a subscription row in the database
- [ ] Profile page shows the correct plan badge
- [ ] SubscriptionManager shows upgrade/downgrade buttons
- [ ] "Manage billing" opens the Stripe Customer Portal
- [ ] Canceling in the portal updates the subscription status
- [ ] Payment failure sets status to `past_due` and shows a warning
- [ ] Free users see upgrade buttons, not downgrade
