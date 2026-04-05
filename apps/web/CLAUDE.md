# slidenerds.com (apps/web)

The hosted service for the open-source `@strategicnerds/slide-nerds` npm package. Next.js 15 App Router deployed to Vercel.

## Running locally

```bash
cd apps/web
doppler run -- npm run dev
```

Or with manual env vars:

```bash
cp .env.local.example .env.local
# Fill in Supabase URL and anon key from: cd ../supabase && npx supabase status
npm run dev
```

## Architecture

### Route groups

- `(marketing)/` -- public pages (landing, pricing, docs)
- `(auth)/` -- login, signup, OAuth callback
- `(app)/` -- authenticated dashboard (profile, slides, team)
- `(viewer)/` -- public deck viewer (/d/:slug)
- `(live)/` -- live presentation (audience + presenter views)
- `api/` -- API routes for CRUD, export, sharing, live, Stripe

### Key directories

- `src/components/layout/` -- AppHeader, AppSidebar, ThemeToggle
- `src/components/profile/` -- AvatarUpload, ProfileForm, DangerZone
- `src/components/slides/` -- DeckGrid, DeckCard, NewDeckDialog, DeckSettingsForm
- `src/lib/supabase/` -- client.ts, server.ts, middleware.ts, database.types.ts, types.ts

### Design system

- NerdsUI tokens via `@strategicnerds/nerdsui-web`
- Tailwind CSS with NerdsUI preset
- CSS custom properties for all colors (dark default, light theme via `.light` class)
- Primary accent: oklch green (#3ECF8E equivalent)
- Never hardcode colors, spacing, or typography. Use NerdsUI tokens.

### Database

Schema lives in `apps/supabase/migrations/`. Generate types after schema changes:

```bash
cd apps/supabase
npx supabase db reset
npx supabase gen types typescript --local > ../web/src/lib/supabase/database.types.ts
```

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL       -- Supabase API URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY  -- Supabase publishable key
STRIPE_SECRET_KEY              -- Stripe secret (for billing, optional)
STRIPE_WEBHOOK_SECRET          -- Stripe webhook signing secret (optional)
```

## Stack

- Next.js 15 App Router
- Supabase (Postgres, Auth, Storage, Realtime)
- @supabase/ssr@0.10 for server-side auth
- NerdsUI design tokens
- Tailwind CSS v4
- Stripe (billing, to be fully integrated)
