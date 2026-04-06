-- Add name column to live_sessions for named/reusable sessions
ALTER TABLE public.live_sessions ADD COLUMN name text;

-- Unique name per deck (nulls allowed for unnamed sessions)
CREATE UNIQUE INDEX idx_live_sessions_deck_name
  ON public.live_sessions(deck_id, name) WHERE name IS NOT NULL;
