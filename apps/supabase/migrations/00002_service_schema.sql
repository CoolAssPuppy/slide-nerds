-- Service schema expansion for slidenerds.com
-- Adds hosting, sharing, export, live presentations, and billing

-- Expand decks table
alter table public.decks add column if not exists slug text unique;
alter table public.decks add column if not exists description text;
alter table public.decks add column if not exists slide_count int default 0;
alter table public.decks add column if not exists thumbnail_url text;
alter table public.decks add column if not exists is_public boolean default false;
alter table public.decks add column if not exists source_type text default 'push';
alter table public.decks add column if not exists deployed_url text;
alter table public.decks add column if not exists version int default 1;

-- Add insert/update/delete policies for decks
create policy "Users can insert their own decks"
  on public.decks for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own decks"
  on public.decks for update
  using (auth.uid() = owner_id);

create policy "Users can delete their own decks"
  on public.decks for delete
  using (auth.uid() = owner_id);

-- Public decks readable by anyone
create policy "Anyone can read public decks"
  on public.decks for select
  using (is_public = true);

-- Share links
create table public.share_links (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  access_type text not null default 'public' check (access_type in ('public', 'email', 'domain', 'password')),
  allowed_emails text[],
  allowed_domains text[],
  password_hash text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.share_links enable row level security;

create policy "Deck owners can manage share links"
  on public.share_links for all
  using (deck_id in (select id from public.decks where owner_id = auth.uid()));

create policy "Anyone can read share links by token"
  on public.share_links for select
  using (true);

-- Slide snapshots for thumbnails
create table public.slide_snapshots (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  slide_index int not null,
  screenshot_path text,
  created_at timestamptz not null default now(),
  unique(deck_id, slide_index)
);

alter table public.slide_snapshots enable row level security;

create policy "Deck owners can manage snapshots"
  on public.slide_snapshots for all
  using (deck_id in (select id from public.decks where owner_id = auth.uid()));

-- Expand deck_views for richer analytics
alter table public.deck_views add column if not exists share_link_id uuid references public.share_links(id);
alter table public.deck_views add column if not exists ip_hash text;
alter table public.deck_views add column if not exists user_agent text;
alter table public.deck_views add column if not exists total_time_seconds int;
alter table public.deck_views add column if not exists slides_viewed int[];

-- Allow anyone to insert view events (anonymous tracking)
create policy "Anyone can record a view"
  on public.deck_views for insert
  with check (true);

-- Live sessions
create table public.live_sessions (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  presenter_id uuid not null references auth.users(id),
  status text not null default 'active' check (status in ('active', 'ended')),
  current_slide int default 0,
  current_step int default 0,
  audience_count int default 0,
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

alter table public.live_sessions enable row level security;

create policy "Presenters can manage their sessions"
  on public.live_sessions for all
  using (presenter_id = auth.uid());

create policy "Anyone can read active sessions"
  on public.live_sessions for select
  using (status = 'active');

-- Polls
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  slide_index int,
  question text not null,
  options jsonb not null,
  is_active boolean default true,
  created_at timestamptz not null default now()
);

alter table public.polls enable row level security;

create policy "Presenters can manage polls"
  on public.polls for all
  using (session_id in (select id from public.live_sessions where presenter_id = auth.uid()));

create policy "Anyone can read active polls"
  on public.polls for select
  using (is_active = true);

-- Poll votes
create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  voter_hash text not null,
  option_index int not null,
  created_at timestamptz not null default now(),
  unique(poll_id, voter_hash)
);

alter table public.poll_votes enable row level security;

create policy "Anyone can vote"
  on public.poll_votes for insert
  with check (true);

create policy "Presenters can read votes"
  on public.poll_votes for select
  using (
    poll_id in (
      select p.id from public.polls p
      join public.live_sessions s on s.id = p.session_id
      where s.presenter_id = auth.uid()
    )
  );

-- Reactions
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_sessions(id) on delete cascade,
  type text not null check (type in ('thumbsup', 'clap', 'heart', 'fire', 'mind_blown')),
  created_at timestamptz not null default now()
);

alter table public.reactions enable row level security;

create policy "Anyone can react"
  on public.reactions for insert
  with check (true);

create policy "Presenters can read reactions"
  on public.reactions for select
  using (
    session_id in (select id from public.live_sessions where presenter_id = auth.uid())
  );

-- Deck versions
create table public.deck_versions (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  version int not null,
  snapshot jsonb,
  created_at timestamptz not null default now(),
  unique(deck_id, version)
);

alter table public.deck_versions enable row level security;

create policy "Deck owners can manage versions"
  on public.deck_versions for all
  using (deck_id in (select id from public.decks where owner_id = auth.uid()));

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can read their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Updated_at triggers for new tables
create trigger set_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Add profile insert policy (missing from initial schema)
create policy "Auto-created profiles are insertable"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('deck-thumbnails', 'deck-thumbnails', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('exports', 'exports', false)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values ('deck-assets', 'deck-assets', true)
  on conflict (id) do nothing;

-- Storage policies
create policy "Public avatar read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Users upload own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users update own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Public thumbnail read" on storage.objects
  for select using (bucket_id = 'deck-thumbnails');

create policy "Public asset read" on storage.objects
  for select using (bucket_id = 'deck-assets');

create policy "Users upload own assets" on storage.objects
  for insert with check (
    bucket_id = 'deck-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users delete own assets" on storage.objects
  for delete using (
    bucket_id = 'deck-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users read own exports" on storage.objects
  for select using (
    bucket_id = 'exports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Enable realtime for live session tables
alter publication supabase_realtime add table public.live_sessions;
alter publication supabase_realtime add table public.polls;
alter publication supabase_realtime add table public.poll_votes;
alter publication supabase_realtime add table public.reactions;
