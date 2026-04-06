-- Fix function search_path warnings
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.increment_audience_count(uuid, int) SET search_path = public;
ALTER FUNCTION public.is_team_owner(uuid) SET search_path = public;
ALTER FUNCTION public.gen_random_bytes(int) SET search_path = public, extensions;

-- Fix overly permissive RLS policies
-- Replace WITH CHECK (true) with checks that require an active session

-- deck_comments: require an active session for the deck
DROP POLICY IF EXISTS "Anyone can comment" ON public.deck_comments;
CREATE POLICY "Anyone can comment on public decks"
  ON public.deck_comments FOR INSERT
  WITH CHECK (
    deck_id IN (SELECT id FROM public.decks WHERE is_public = true)
    OR auth.uid() IS NOT NULL
  );

-- deck_views: require a valid deck_id
DROP POLICY IF EXISTS "Anyone can record a view" ON public.deck_views;
CREATE POLICY "Anyone can record a view"
  ON public.deck_views FOR INSERT
  WITH CHECK (
    deck_id IN (SELECT id FROM public.decks)
  );

-- poll_votes: require the poll to be in an active session
DROP POLICY IF EXISTS "Anyone can vote" ON public.poll_votes;
CREATE POLICY "Anyone can vote on active polls"
  ON public.poll_votes FOR INSERT
  WITH CHECK (
    poll_id IN (
      SELECT p.id FROM public.polls p
      JOIN public.live_sessions s ON s.id = p.session_id
      WHERE s.status = 'active' AND p.is_active = true
    )
  );

-- qa_questions: require an active session
DROP POLICY IF EXISTS "Anyone can submit questions" ON public.qa_questions;
CREATE POLICY "Anyone can submit questions in active sessions"
  ON public.qa_questions FOR INSERT
  WITH CHECK (
    session_id IN (SELECT id FROM public.live_sessions WHERE status = 'active')
  );

-- reactions: require an active session
DROP POLICY IF EXISTS "Anyone can react" ON public.reactions;
CREATE POLICY "Anyone can react in active sessions"
  ON public.reactions FOR INSERT
  WITH CHECK (
    session_id IN (SELECT id FROM public.live_sessions WHERE status = 'active')
  );

-- word_cloud_entries: require an active session
DROP POLICY IF EXISTS "Anyone can submit words" ON public.word_cloud_entries;
CREATE POLICY "Anyone can submit words in active sessions"
  ON public.word_cloud_entries FOR INSERT
  WITH CHECK (
    session_id IN (SELECT id FROM public.live_sessions WHERE status = 'active')
  );
