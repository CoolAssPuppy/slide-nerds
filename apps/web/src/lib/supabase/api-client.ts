import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from './server'
import type { Database } from './database.types'
import type { SupabaseClient, User } from '@supabase/supabase-js'

type AuthenticatedClient = {
  supabase: SupabaseClient<Database>
  user: User | null
}

/**
 * Creates a Supabase client for API routes that support both:
 * - Cookie-based auth (browser requests)
 * - Bearer token auth (CLI requests)
 *
 * Returns both the client and the authenticated user.
 */
export const createApiClient = async (request: Request): Promise<AuthenticatedClient> => {
  const authHeader = request.headers.get('authorization')

  if (authHeader?.startsWith('Bearer ')) {
    const accessToken = authHeader.slice(7)

    const supabase = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )

    // Pass the token explicitly to getUser so it verifies this
    // specific JWT rather than looking for a session in the store.
    const { data: { user } } = await supabase.auth.getUser(accessToken)

    return { supabase, user }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return { supabase, user }
}
