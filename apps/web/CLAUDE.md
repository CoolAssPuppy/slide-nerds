# slidenerds.com (apps/web)

The public website and paid platform. Next.js 15 App Router deployed to Vercel.

## What lives here

- Marketing site (landing page, pricing, docs)
- Auth (GitHub login, SSO, email via Supabase Auth)
- Personal skill library hosting
- Brand library sync (brand.config.ts synced to cloud, pulled into decks on create)
- Analytics dashboard (views, unique visitors, slide dwell time, completion rate)
- Team features (shared skills, brand enforcement, comments, permissions)
- Custom domain support (CNAME to slidenerds.com for team skill libraries)
- Billing ($4/user/month for teams via Stripe)

## What does NOT live here

- The runtime package (packages/runtime)
- The CLI (packages/cli)
- The skill library SKILL.md files (skills/)
- Database schema and migrations (apps/supabase/)
- iOS app (apps/ios/)
- Deck hosting (decks deploy to Vercel directly, not through this app)

## Architecture

- `src/app/` -- Next.js App Router pages and API routes
- `src/components/` -- React components
- `src/lib/supabase/` -- Supabase client (server, browser, middleware)
- `src/middleware.ts` -- Auth session refresh on every request
- Uses `@slidenerds/runtime` as a workspace dependency for shared types (BrandConfig, etc.)

## Stack

- Next.js 15 (App Router)
- Supabase (Postgres, Auth, Storage) -- schema lives in apps/supabase/
- @supabase/ssr for server-side auth
- Stripe for billing (to be added)
- Tailwind CSS

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from `npx supabase status` after starting local Supabase.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run typecheck  # TypeScript strict mode
```
