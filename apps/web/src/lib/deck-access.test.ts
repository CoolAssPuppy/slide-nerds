import { describe, it, expect, vi } from 'vitest'
import { checkDeckAccess } from './deck-access'

// -- Test data factories --

const makeDeck = (overrides: Record<string, unknown> = {}) => ({
  id: 'deck-1',
  owner_id: 'owner-1',
  team_id: null as string | null,
  name: 'Test Deck',
  slug: 'test-deck',
  is_public: false,
  bundle_path: 'owner-1/deck-1/1',
  bundle_size_bytes: 1024,
  source_type: 'push',
  deployed_url: null,
  version: 1,
  description: null,
  slide_count: 5,
  thumbnail_url: null,
  source_url: null,
  url: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

const makeShareLink = (overrides: Record<string, unknown> = {}) => ({
  id: 'link-1',
  deck_id: 'deck-1',
  token: 'valid-token-abc123',
  access_type: 'public',
  allowed_emails: null,
  allowed_domains: null,
  password_hash: null,
  expires_at: null,
  created_at: '2025-01-01T00:00:00Z',
  ...overrides,
})

type MockQueryResult<T> = {
  data: T | null
  error: null
}

const makeMockClient = (options: {
  deck?: ReturnType<typeof makeDeck> | null
  teamMembership?: { user_id: string } | null
  shareLink?: ReturnType<typeof makeShareLink> | null
}) => {
  const { deck = null, teamMembership = null, shareLink = null } = options

  const singleFn = vi.fn()

  const fromMock = vi.fn().mockImplementation((table: string) => {
    const chainable = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: singleFn,
    }

    if (table === 'decks') {
      singleFn.mockResolvedValueOnce({ data: deck, error: null } as MockQueryResult<typeof deck>)
    } else if (table === 'team_members') {
      singleFn.mockResolvedValueOnce({ data: teamMembership, error: null } as MockQueryResult<typeof teamMembership>)
    } else if (table === 'share_links') {
      singleFn.mockResolvedValueOnce({ data: shareLink, error: null } as MockQueryResult<typeof shareLink>)
    } else {
      singleFn.mockResolvedValueOnce({ data: null, error: null })
    }

    return chainable
  })

  return { from: fromMock } as unknown as Parameters<typeof checkDeckAccess>[0]['adminClient']
}


// -- Tests --

describe('checkDeckAccess', () => {
  describe('deck not found', () => {
    it('should deny access when deck does not exist', async () => {
      const client = makeMockClient({ deck: null })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'nonexistent',
        userId: 'user-1',
        shareToken: null,
      })

      expect(result.access).toEqual({ granted: false, reason: 'not_found' })
      expect(result.deck).toBeNull()
    })
  })

  describe('public decks', () => {
    it('should grant access to anyone when deck is public', async () => {
      const deck = makeDeck({ is_public: true })
      const client = makeMockClient({ deck })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: null,
        shareToken: null,
      })

      expect(result.access).toEqual({ granted: true, reason: 'public' })
      expect(result.deck).toEqual(deck)
    })

    it('should grant access to unauthenticated users when deck is public', async () => {
      const deck = makeDeck({ is_public: true })
      const client = makeMockClient({ deck })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: null,
        shareToken: null,
      })

      expect(result.access.granted).toBe(true)
    })
  })

  describe('owner access', () => {
    it('should grant access to the deck owner', async () => {
      const deck = makeDeck({ is_public: false, owner_id: 'owner-1' })
      const client = makeMockClient({ deck })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: 'owner-1',
        shareToken: null,
      })

      expect(result.access).toEqual({ granted: true, reason: 'owner' })
    })

    it('should deny access to a different user who is not the owner', async () => {
      const deck = makeDeck({ is_public: false, owner_id: 'owner-1' })
      const client = makeMockClient({ deck })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: 'stranger-1',
        shareToken: null,
      })

      expect(result.access).toEqual({ granted: false, reason: 'unauthorized' })
    })

    it('should deny access to unauthenticated users on private decks', async () => {
      const deck = makeDeck({ is_public: false })
      const client = makeMockClient({ deck })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: null,
        shareToken: null,
      })

      expect(result.access).toEqual({ granted: false, reason: 'unauthorized' })
    })
  })

  describe('team member access', () => {
    it('should grant access to a team member on a team deck', async () => {
      const deck = makeDeck({ is_public: false, team_id: 'team-1', owner_id: 'owner-1' })
      const client = makeMockClient({
        deck,
        teamMembership: { user_id: 'member-1' },
      })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: 'member-1',
        shareToken: null,
      })

      expect(result.access).toEqual({ granted: true, reason: 'team_member' })
    })

    it('should deny access to non-team-member on a team deck', async () => {
      const deck = makeDeck({ is_public: false, team_id: 'team-1', owner_id: 'owner-1' })
      const client = makeMockClient({
        deck,
        teamMembership: null,
      })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: 'outsider-1',
        shareToken: null,
      })

      expect(result.access).toEqual({ granted: false, reason: 'unauthorized' })
    })

    it('should not check team membership when deck has no team', async () => {
      const deck = makeDeck({ is_public: false, team_id: null, owner_id: 'owner-1' })
      const client = makeMockClient({ deck })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: 'stranger-1',
        shareToken: null,
      })

      expect(result.access).toEqual({ granted: false, reason: 'unauthorized' })
      // Should only have called from('decks'), not from('team_members')
      expect(client.from).toHaveBeenCalledTimes(1)
    })
  })

  describe('share token access', () => {
    it('should grant access with a valid share token', async () => {
      const deck = makeDeck({ is_public: false })
      const shareLink = makeShareLink({ deck_id: 'deck-1' })
      const client = makeMockClient({ deck, shareLink })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: null,
        shareToken: 'valid-token-abc123',
      })

      expect(result.access).toEqual({ granted: true, reason: 'share_token' })
    })

    it('should deny access with an invalid share token', async () => {
      const deck = makeDeck({ is_public: false })
      const client = makeMockClient({ deck, shareLink: null })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: null,
        shareToken: 'bogus-token',
      })

      expect(result.access).toEqual({ granted: false, reason: 'invalid_token' })
    })

    it('should deny access with an expired share token', async () => {
      const deck = makeDeck({ is_public: false })
      const shareLink = makeShareLink({
        deck_id: 'deck-1',
        expires_at: '2020-01-01T00:00:00Z',
      })
      const client = makeMockClient({ deck, shareLink })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: null,
        shareToken: 'valid-token-abc123',
      })

      expect(result.access).toEqual({ granted: false, reason: 'expired_token' })
    })

    it('should grant access with a non-expired share token', async () => {
      const deck = makeDeck({ is_public: false })
      const futureDate = new Date(Date.now() + 86400000).toISOString()
      const shareLink = makeShareLink({
        deck_id: 'deck-1',
        expires_at: futureDate,
      })
      const client = makeMockClient({ deck, shareLink })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: null,
        shareToken: 'valid-token-abc123',
      })

      expect(result.access).toEqual({ granted: true, reason: 'share_token' })
    })
  })

  describe('priority order', () => {
    it('should check public status before owner', async () => {
      const deck = makeDeck({ is_public: true, owner_id: 'owner-1' })
      const client = makeMockClient({ deck })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: 'owner-1',
        shareToken: null,
      })

      // Public wins even when owner is authenticated
      expect(result.access.reason).toBe('public')
    })

    it('should check owner before team membership', async () => {
      const deck = makeDeck({ is_public: false, team_id: 'team-1', owner_id: 'owner-1' })
      const client = makeMockClient({
        deck,
        teamMembership: { user_id: 'owner-1' },
      })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: 'owner-1',
        shareToken: null,
      })

      // Owner check wins before team check
      expect(result.access.reason).toBe('owner')
      // team_members table should not have been queried
      expect(client.from).toHaveBeenCalledTimes(1)
    })

    it('should check team membership before share token', async () => {
      const deck = makeDeck({ is_public: false, team_id: 'team-1', owner_id: 'owner-1' })
      const shareLink = makeShareLink({ deck_id: 'deck-1' })
      const client = makeMockClient({
        deck,
        teamMembership: { user_id: 'member-1' },
        shareLink,
      })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: 'member-1',
        shareToken: 'valid-token-abc123',
      })

      expect(result.access.reason).toBe('team_member')
    })
  })

  describe('edge cases', () => {
    it('should deny access when userId is null and no share token on private deck', async () => {
      const deck = makeDeck({ is_public: false })
      const client = makeMockClient({ deck })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: null,
        shareToken: null,
      })

      expect(result.access.granted).toBe(false)
    })

    it('should still return deck data on access denied', async () => {
      const deck = makeDeck({ is_public: false })
      const client = makeMockClient({ deck })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: 'stranger',
        shareToken: null,
      })

      expect(result.access.granted).toBe(false)
      expect(result.deck).toEqual(deck)
    })

    it('should treat share token with null expires_at as non-expiring', async () => {
      const deck = makeDeck({ is_public: false })
      const shareLink = makeShareLink({ expires_at: null })
      const client = makeMockClient({ deck, shareLink })

      const result = await checkDeckAccess({
        adminClient: client,
        deckId: 'deck-1',
        userId: null,
        shareToken: 'valid-token-abc123',
      })

      expect(result.access).toEqual({ granted: true, reason: 'share_token' })
    })
  })
})
