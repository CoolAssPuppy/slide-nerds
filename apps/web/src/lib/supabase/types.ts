import type { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Deck = Tables<'decks'>
export type DeckView = Tables<'deck_views'>
export type ShareLink = Tables<'share_links'>
export type LiveSession = Tables<'live_sessions'>
export type Poll = Tables<'polls'>
export type PollVote = Tables<'poll_votes'>
export type Reaction = Tables<'reactions'>
export type Subscription = Tables<'subscriptions'>
export type Team = Tables<'teams'>
export type TeamMember = Tables<'team_members'>
export type BrandConfig = Tables<'brand_configs'>
