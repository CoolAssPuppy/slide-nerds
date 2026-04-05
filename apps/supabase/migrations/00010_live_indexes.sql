-- Indexes for live features RLS policy performance

create index if not exists idx_live_sessions_status on public.live_sessions(id, status);
create index if not exists idx_polls_session_id on public.polls(session_id);
create index if not exists idx_qa_questions_session_id on public.qa_questions(session_id);
create index if not exists idx_word_cloud_entries_session_id on public.word_cloud_entries(session_id);
create index if not exists idx_poll_votes_poll_id on public.poll_votes(poll_id);
create index if not exists idx_reactions_session_id on public.reactions(session_id);
