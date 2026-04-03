-- Initial schema for slidenerds platform
-- Users are managed by Supabase Auth. This schema covers platform-specific data.

-- User profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teams enable row level security;

-- Team memberships
create table public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

alter table public.team_members enable row level security;

create policy "Team members can read their team"
  on public.teams for select
  using (
    id in (select team_id from public.team_members where user_id = auth.uid())
  );

create policy "Team members can read memberships"
  on public.team_members for select
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

-- Brand configs (per user or per team)
create table public.brand_configs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  team_id uuid references public.teams(id),
  name text not null default 'Default',
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint brand_config_owner check (
    (owner_id is not null and team_id is null)
    or (owner_id is null and team_id is not null)
  )
);

alter table public.brand_configs enable row level security;

create policy "Users can read their own brand configs"
  on public.brand_configs for select
  using (owner_id = auth.uid());

create policy "Team members can read team brand configs"
  on public.brand_configs for select
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

-- Deck analytics (opt-in tracking)
create table public.decks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id),
  team_id uuid references public.teams(id),
  name text not null,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.decks enable row level security;

create policy "Users can read their own decks"
  on public.decks for select
  using (owner_id = auth.uid());

create policy "Team members can read team decks"
  on public.decks for select
  using (
    team_id in (select team_id from public.team_members where user_id = auth.uid())
  );

create table public.deck_views (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  viewer_id uuid references auth.users(id),
  slide_index integer not null,
  dwell_seconds integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.deck_views enable row level security;

create policy "Deck owners can read their deck views"
  on public.deck_views for select
  using (
    deck_id in (select id from public.decks where owner_id = auth.uid())
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_teams_updated_at before update on public.teams
  for each row execute function public.set_updated_at();

create trigger set_brand_configs_updated_at before update on public.brand_configs
  for each row execute function public.set_updated_at();

create trigger set_decks_updated_at before update on public.decks
  for each row execute function public.set_updated_at();
