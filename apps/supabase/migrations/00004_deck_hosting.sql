-- Deck hosting: bundle storage, upload tracking, export counts

-- Add bundle storage columns to decks
alter table public.decks add column if not exists bundle_path text;
alter table public.decks add column if not exists bundle_size_bytes bigint;
alter table public.decks add column if not exists source_url text;

-- Export usage tracking for free tier (5 exports/month limit)
create table if not exists public.export_counts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  count int not null default 0,
  created_at timestamptz not null default now(),
  unique(user_id, month)
);

alter table public.export_counts enable row level security;

create policy "Users can read own export counts"
  on public.export_counts for select
  using (auth.uid() = user_id);

create policy "Users can insert own export counts"
  on public.export_counts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own export counts"
  on public.export_counts for update
  using (auth.uid() = user_id);

-- Storage bucket for deck bundles (private, access controlled by application)
insert into storage.buckets (id, name, public)
values ('deck-bundles', 'deck-bundles', false)
on conflict (id) do nothing;

-- Only authenticated users can upload to their own folder
create policy "Users upload own bundles"
  on storage.objects for insert
  with check (
    bucket_id = 'deck-bundles'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own bundles
create policy "Users read own bundles"
  on storage.objects for select
  using (
    bucket_id = 'deck-bundles'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own bundles
create policy "Users delete own bundles"
  on storage.objects for delete
  using (
    bucket_id = 'deck-bundles'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
