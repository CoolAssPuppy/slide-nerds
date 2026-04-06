-- Allow poll creation in active sessions (for auto-creation from LivePoll component)
CREATE POLICY "Anyone can create polls in active sessions"
  ON public.polls FOR INSERT
  WITH CHECK (
    session_id IN (SELECT id FROM public.live_sessions WHERE status = 'active')
  );
