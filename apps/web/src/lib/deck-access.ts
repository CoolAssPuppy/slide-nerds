import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase/database.types'

type DeckRow = Database['public']['Tables']['decks']['Row']

type AccessResult =
  | { granted: true; reason: 'public' | 'owner' | 'team_member' | 'share_token' }
  | { granted: false; reason: 'not_found' | 'unauthorized' | 'expired_token' | 'invalid_token' }

type CheckAccessOptions = {
  adminClient: SupabaseClient<Database>
  deckId: string
  userId: string | null
  shareToken: string | null
}

export async function checkDeckAccess(options: CheckAccessOptions): Promise<{
  access: AccessResult
  deck: DeckRow | null
}> {
  const { adminClient, deckId, userId, shareToken } = options

  const { data: deck } = await adminClient
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .single()

  if (!deck) {
    return { access: { granted: false, reason: 'not_found' }, deck: null }
  }

  if (deck.is_public) {
    return { access: { granted: true, reason: 'public' }, deck }
  }

  if (userId && deck.owner_id === userId) {
    return { access: { granted: true, reason: 'owner' }, deck }
  }

  if (userId && deck.team_id) {
    const { data: membership } = await adminClient
      .from('team_members')
      .select('user_id')
      .eq('team_id', deck.team_id)
      .eq('user_id', userId)
      .single()

    if (membership) {
      return { access: { granted: true, reason: 'team_member' }, deck }
    }
  }

  if (shareToken) {
    const { data: shareLink } = await adminClient
      .from('share_links')
      .select('expires_at, access_type')
      .eq('token', shareToken)
      .eq('deck_id', deckId)
      .single()

    if (!shareLink) {
      return { access: { granted: false, reason: 'invalid_token' }, deck }
    }

    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return { access: { granted: false, reason: 'expired_token' }, deck }
    }

    return { access: { granted: true, reason: 'share_token' }, deck }
  }

  return { access: { granted: false, reason: 'unauthorized' }, deck }
}
