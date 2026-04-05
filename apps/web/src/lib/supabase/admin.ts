import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

let _client: SupabaseClient<Database> | null = null

function getAdminClient(): SupabaseClient<Database> {
  if (!_client) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SB_SECRET_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SB_SECRET_KEY. ' +
        'The admin client requires the secret key for server-side operations.'
      )
    }

    _client = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return _client
}

export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop, receiver) {
    const client = getAdminClient()
    const value = Reflect.get(client, prop, receiver)
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})
