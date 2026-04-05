-- Live features: Q&A questions and word cloud entries

-- Q&A questions for live sessions
create table public.qa_questions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  slide_index int not null default 0,
  content text not null,
  author_name text,
  is_answered boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.qa_questions enable row level security;

create policy "Anyone can submit questions"
  on public.qa_questions for insert
  with check (true);

create policy "Anyone can read questions for active sessions"
  on public.qa_questions for select
  using (
    session_id in (select id from public.live_sessions where status = 'active')
  );

create policy "Presenters can update questions"
  on public.qa_questions for update
  using (
    session_id in (select id from public.live_sessions where presenter_id = auth.uid())
  );

-- Word cloud entries for live sessions
create table public.word_cloud_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  slide_index int not null default 0,
  word text not null,
  voter_hash text not null,
  created_at timestamptz not null default now(),
  unique(session_id, slide_index, voter_hash)
);

alter table public.word_cloud_entries enable row level security;

create policy "Anyone can submit words"
  on public.word_cloud_entries for insert
  with check (true);

create policy "Anyone can read words for active sessions"
  on public.word_cloud_entries for select
  using (
    session_id in (select id from public.live_sessions where status = 'active')
  );

-- Also let anyone read reactions for active sessions (needed for audience view)
create policy "Anyone can read reactions for active sessions"
  on public.reactions for select
  using (
    session_id in (select id from public.live_sessions where status = 'active')
  );

-- Also let anyone read poll votes for active sessions (needed for results)
create policy "Anyone can read votes for active polls"
  on public.poll_votes for select
  using (
    poll_id in (
      select p.id from public.polls p
      join public.live_sessions s on s.id = p.session_id
      where s.status = 'active'
    )
  );

-- RPC to atomically increment audience count
create or replace function public.increment_audience_count(
  p_session_id uuid,
  p_increment int
)
returns void
language plpgsql
security definer
as $$
begin
  update public.live_sessions
  set audience_count = greatest(0, coalesce(audience_count, 0) + p_increment)
  where id = p_session_id
    and status = 'active';
end;
$$;

-- Add new tables to realtime publication
alter publication supabase_realtime add table public.qa_questions;
alter publication supabase_realtime add table public.word_cloud_entries;
