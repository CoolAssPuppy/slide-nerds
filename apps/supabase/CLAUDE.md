# Supabase (apps/supabase)

Database schema, migrations, and seed data for the slidenerds platform.

## Structure

- `config.toml` -- Supabase local dev configuration
- `migrations/` -- SQL migrations in numbered order
- `seed/` -- Seed data for local development

## Schema overview

- `profiles` -- extends auth.users with display_name and avatar
- `teams` -- team accounts with slug and owner
- `team_members` -- membership with role (owner, admin, member)
- `brand_configs` -- brand.config.ts stored as JSONB, owned by user or team
- `decks` -- registered decks for analytics tracking
- `deck_views` -- per-slide view events with dwell time

All tables have RLS enabled. Policies enforce that users only see their own data or data from teams they belong to.

## Commands

```bash
# Start local Supabase (from repo root)
npx supabase start

# Apply migrations
npx supabase db push

# Generate TypeScript types
npx supabase gen types typescript --local > apps/web/src/lib/supabase/database.types.ts

# Reset database
npx supabase db reset
```

## Conventions

- Migrations are declarative SQL files, numbered sequentially
- Every table that stores user data has RLS enabled
- Use auth.uid() in policies, never bypass RLS from client code
- JSONB for flexible configs (brand_configs.config)
- Timestamps are timestamptz, defaulting to now()
- updated_at is managed by triggers, not application code
