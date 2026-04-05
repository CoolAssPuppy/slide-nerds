import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { AvatarUpload } from '@/components/profile/AvatarUpload'
import { DangerZone } from '@/components/profile/DangerZone'
import { SubscriptionManager } from '@/components/billing/SubscriptionManager'
import type { Profile, Subscription } from '@/lib/supabase/types'
import type { Plan } from '@/lib/stripe/config'

export const metadata = { title: 'Profile' }

export default async function ProfilePage() {
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

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Profile</h1>

      <div className="space-y-8">
        <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            Avatar
          </h2>
          <AvatarUpload
            userId={user!.id}
            currentUrl={profile?.avatar_url ?? undefined}
            displayName={profile?.display_name ?? undefined}
          />
        </section>

        <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            Details
          </h2>
          <ProfileForm
            firstName={profile?.first_name ?? ''}
            lastName={profile?.last_name ?? ''}
            companyName={profile?.company_name ?? ''}
            email={user!.email ?? ''}
            plan={currentPlan}
          />
        </section>

        <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            Subscription
          </h2>
          <SubscriptionManager
            currentPlan={currentPlan}
            status={subscription?.status ?? 'active'}
            hasStripeCustomer={Boolean(subscription?.stripe_customer_id)}
          />
        </section>

        <section className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--destructive)] uppercase tracking-wider mb-4">
            Danger zone
          </h2>
          <DangerZone />
        </section>
      </div>
    </div>
  )
}
