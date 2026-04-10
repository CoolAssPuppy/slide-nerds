alter table public.profiles add column if not exists push_enabled boolean;

update public.profiles
set push_enabled = false
where push_enabled is null;

alter table public.profiles
  alter column push_enabled set default false,
  alter column push_enabled set not null;
