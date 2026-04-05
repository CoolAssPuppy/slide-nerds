import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase/database.types'
import type { Plan } from './stripe/config'

const DECK_LIMITS: Record<Plan, number> = {
  free: 3,
  pro: Infinity,
  team: Infinity,
}

const EXPORT_LIMITS: Record<Plan, number> = {
  free: 5,
  pro: Infinity,
  team: Infinity,
}

const UPLOAD_SIZE_LIMITS: Record<Plan, number> = {
  free: 50 * 1024 * 1024,
  pro: 200 * 1024 * 1024,
  team: 500 * 1024 * 1024,
}

export async function getUserPlan(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Plan> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single()

  return (data?.plan as Plan) ?? 'free'
}

export async function canCreateDeck(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const plan = await getUserPlan(supabase, userId)
  const limit = DECK_LIMITS[plan]

  if (limit === Infinity) return { allowed: true }

  const { count } = await supabase
    .from('decks')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', userId)

  const currentCount = count ?? 0

  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `Free plan allows ${limit} decks. Upgrade to Pro for unlimited decks.`,
    }
  }

  return { allowed: true }
}

export function canShareRestricted(plan: Plan): boolean {
  return plan !== 'free'
}

export async function canExport(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
  const plan = await getUserPlan(supabase, userId)
  const limit = EXPORT_LIMITS[plan]

  if (limit === Infinity) return { allowed: true, remaining: Infinity }

  const month = new Date().toISOString().slice(0, 7)
  const { data } = await supabase
    .from('export_counts')
    .select('count')
    .eq('user_id', userId)
    .eq('month', month)
    .single()

  const used = data?.count ?? 0
  const remaining = limit - used

  if (remaining <= 0) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Free plan allows ${limit} exports per month. Upgrade to Pro for unlimited exports.`,
    }
  }

  return { allowed: true, remaining }
}

export function getUploadSizeLimit(plan: Plan): number {
  return UPLOAD_SIZE_LIMITS[plan]
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
