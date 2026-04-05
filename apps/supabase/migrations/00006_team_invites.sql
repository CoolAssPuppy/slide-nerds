-- Team invitation system

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  invited_by uuid not null references auth.users(id),
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  unique(team_id, email)
);

alter table public.team_invites enable row level security;

-- Team owners/admins can manage invites
create policy "Team admins can manage invites"
  on public.team_invites for all
  using (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Users can read invites addressed to their email
create policy "Users can read their own invites"
  on public.team_invites for select
  using (
    email in (select email from auth.users where id = auth.uid())
  );

-- Allow team owners and admins to manage members
create policy "Team admins can add members"
  on public.team_members for insert
  with check (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
    or user_id = auth.uid()
  );

create policy "Team admins can update member roles"
  on public.team_members for update
  using (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

create policy "Team admins can remove members"
  on public.team_members for delete
  using (
    team_id in (
      select team_id from public.team_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
    or user_id = auth.uid()
  );
