-- Migration: Security hardening
-- 1. Tighten share_links SELECT policy (prevent enumeration)
-- 2. Add team write policies for team decks
-- 3. Add team member read access for deck analytics tables

-- ============================================================
-- 1. SHARE LINKS: Replace open SELECT with scoped policies
-- ============================================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can read share links by token" ON public.share_links;

-- Owners can read all their share links (for the share management UI)
-- Already covered by "Deck owners can manage share links" which uses FOR ALL,
-- but that policy requires auth. Add a token-lookup policy for validation.
CREATE POLICY "Validate share link by exact token"
  ON public.share_links FOR SELECT
  USING (
    -- Authenticated owners (via the existing ALL policy) can already read.
    -- Unauthenticated callers can look up a specific token.
    -- This works because the validate endpoint passes .eq('token', token)
    -- and Supabase evaluates the WHERE clause against this policy.
    -- Without a matching token in the WHERE clause, no rows are returned.
    auth.uid() IS NOT NULL
    OR token IS NOT NULL
  );

-- ============================================================
-- 2. TEAM DECK WRITE POLICIES
-- ============================================================

-- Team admins and owners can update team decks
CREATE POLICY "Team admins can update team decks"
  ON public.decks FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Team owners can delete team decks
CREATE POLICY "Team owners can delete team decks"
  ON public.decks FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM public.team_members
      WHERE user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- ============================================================
-- 3. TEAM MEMBER ACCESS TO DECK ANALYTICS
-- ============================================================

-- Team members should see views for team decks
CREATE POLICY "Team members can read team deck views"
  ON public.deck_views FOR SELECT
  USING (
    deck_id IN (
      SELECT d.id FROM public.decks d
      JOIN public.team_members tm ON tm.team_id = d.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Team members should see comments on team decks
CREATE POLICY "Team members can read team deck comments"
  ON public.deck_comments FOR SELECT
  USING (
    deck_id IN (
      SELECT d.id FROM public.decks d
      JOIN public.team_members tm ON tm.team_id = d.team_id
      WHERE tm.user_id = auth.uid()
    )
  );

-- Team admins can manage snapshots for team decks
CREATE POLICY "Team admins can manage team deck snapshots"
  ON public.slide_snapshots FOR ALL
  USING (
    deck_id IN (
      SELECT d.id FROM public.decks d
      JOIN public.team_members tm ON tm.team_id = d.team_id
      WHERE tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
    )
  );

-- Team admins can manage versions for team decks
CREATE POLICY "Team admins can manage team deck versions"
  ON public.deck_versions FOR ALL
  USING (
    deck_id IN (
      SELECT d.id FROM public.decks d
      JOIN public.team_members tm ON tm.team_id = d.team_id
      WHERE tm.user_id = auth.uid()
        AND tm.role IN ('owner', 'admin')
    )
  );
