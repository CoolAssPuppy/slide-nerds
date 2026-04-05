-- Custom domains and deck comments

-- Custom domain mapping for Team tier
create table if not exists public.custom_domains (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references public.decks(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  domain text unique not null,
  verification_token text not null default encode(gen_random_bytes(16), 'hex'),
  is_verified boolean not null default false,
  ssl_status text not null default 'pending' check (ssl_status in ('pending', 'active', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.custom_domains enable row level security;

-- Team owners/admins can manage custom domains
create policy "Team members can manage custom domains"
  on public.custom_domains for all
  using (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
    or deck_id in (
      select id from public.decks where owner_id = auth.uid()
    )
  );

-- Deck comments for viewer feedback
create table if not exists public.deck_comments (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  slide_index int,
  author_email text not null,
  author_name text,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.deck_comments enable row level security;

-- Deck owners can read comments on their decks
create policy "Deck owners can read comments"
  on public.deck_comments for select
  using (deck_id in (select id from public.decks where owner_id = auth.uid()));

-- Anyone can insert comments (public feedback)
create policy "Anyone can comment"
  on public.deck_comments for insert
  with check (true);

-- Deck owners can delete comments on their decks
create policy "Deck owners can delete comments"
  on public.deck_comments for delete
  using (deck_id in (select id from public.decks where owner_id = auth.uid()));
