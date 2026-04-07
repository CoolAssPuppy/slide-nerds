-- Slide tags and deck-tag assignments

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6B7280',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_name_length check (char_length(trim(name)) between 1 and 40),
  constraint tags_color_hex check (color ~ '^#[0-9A-Fa-f]{6}$')
);

create unique index tags_owner_name_unique on public.tags (owner_id, lower(name));

create table public.deck_tags (
  deck_id uuid not null references public.decks(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (deck_id, tag_id)
);

create index deck_tags_tag_id_idx on public.deck_tags (tag_id);

alter table public.tags enable row level security;
alter table public.deck_tags enable row level security;

create policy "Users can read their own tags"
  on public.tags for select
  using (owner_id = auth.uid());

create policy "Users can create their own tags"
  on public.tags for insert
  with check (owner_id = auth.uid());

create policy "Users can update their own tags"
  on public.tags for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Users can delete their own tags"
  on public.tags for delete
  using (owner_id = auth.uid());

create policy "Users can read tags assigned to visible decks"
  on public.deck_tags for select
  using (
    deck_id in (
      select id from public.decks
      where owner_id = auth.uid()
        or is_public = true
        or team_id in (
          select team_id from public.team_members where user_id = auth.uid()
        )
    )
  );

create policy "Deck owners and team admins can assign tags"
  on public.deck_tags for insert
  with check (
    tag_id in (select id from public.tags where owner_id = auth.uid())
    and deck_id in (
      select d.id from public.decks d
      left join public.team_members tm
        on d.team_id = tm.team_id and tm.user_id = auth.uid()
      where d.owner_id = auth.uid()
        or tm.role in ('owner', 'admin')
    )
  );

create policy "Deck owners and team admins can remove tags"
  on public.deck_tags for delete
  using (
    tag_id in (select id from public.tags where owner_id = auth.uid())
    and deck_id in (
      select d.id from public.decks d
      left join public.team_members tm
        on d.team_id = tm.team_id and tm.user_id = auth.uid()
      where d.owner_id = auth.uid()
        or tm.role in ('owner', 'admin')
    )
  );

create trigger set_tags_updated_at before update on public.tags
  for each row execute function public.set_updated_at();
