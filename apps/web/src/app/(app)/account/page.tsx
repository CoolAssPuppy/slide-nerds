import { createClient } from '@/lib/supabase/server'
import { SubscriptionManager } from '@/components/billing/SubscriptionManager'
import { CustomDomainSettings } from '@/components/slides/CustomDomainSettings'
import { CompanySettings } from '@/components/account/CompanySettings'
import type { Profile, Subscription } from '@/lib/supabase/types'
import type { Plan } from '@/lib/stripe/config'

export const metadata = { title: 'Account' }

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()
  const profile = profileData as Profile | null

  const { data: subData } = await supabase
    .from('subscriptions')
    .select('plan, status, stripe_customer_id')
    .eq('user_id', user!.id)
    .single()
  const subscription = subData as Pick<Subscription, 'plan' | 'status' | 'stripe_customer_id'> | null

  const currentPlan = (subscription?.plan ?? 'free') as Plan

  // Get user's decks for custom domain linking
  const { data: decks } = await supabase
    .from('decks')
    .select('id, name, slug')
    .eq('owner_id', user!.id)
    .order('name')

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Account</h1>

      <div className="space-y-8">
        <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            Company
          </h2>
          <CompanySettings
            companyName={profile?.company_name ?? ''}
            userId={user!.id}
          />
        </section>

        <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            Billing
          </h2>
          <SubscriptionManager
            currentPlan={currentPlan}
            status={subscription?.status ?? 'active'}
            hasStripeCustomer={Boolean(subscription?.stripe_customer_id)}
          />
        </section>

        {currentPlan === 'team' && (
          <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
              Custom domains
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Point your own domain to a hosted deck. Add a CNAME record pointing to <code className="text-[var(--primary)]">decks.slidenerds.com</code>, then verify below.
            </p>
            {(decks ?? []).length > 0 ? (
              <CustomDomainSettings deckId={(decks ?? [])[0].id} />
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">Create a deck first to set up a custom domain.</p>
            )}
          </section>
        )}

        {currentPlan !== 'team' && (
          <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
              Custom domains
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Custom domains are available on the Team plan. Upgrade to point your own domain to your hosted decks.
            </p>
          </section>
        )}
      </div>
    </div>
  )
}
