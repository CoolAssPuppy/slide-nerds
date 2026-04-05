# slidenerds.com service spec

## Overview

slidenerds.com is the hosted service layer for the open-source `@strategicnerds/slide-nerds` npm package. The open-source package handles building and previewing slides locally. The service handles everything that requires a server: hosting, sharing, export, live presentation features, and analytics.

The relationship is Git to GitHub. You build locally, you push to the service when you want to share or export.

## The split

### Open source (npm package) -- stays free forever

- Build slides with an LLM (Claude Code, Cursor, etc.)
- Runtime: navigate, animate, Magic Move, shapes, speaker notes, Light Table
- Brand system, 18 skills, shape system
- `npm run dev` for local preview
- Deploys to Vercel/Netlify as a standard Next.js app
- Export as PDF (alpha, client-side)

### Service (slidenerds.com) -- paid tiers

- Host and share decks with a URL
- Server-side export (PDF, PPTX) via Puppeteer -- pixel-perfect, no CSS filter bugs
- Live presentation mode with audience features (polls, reactions, Q&A)
- View analytics (who viewed, which slides, how long)
- Version history and deck management
- Team workspaces
- Custom domains for hosted decks

## Architecture

### Tech stack

- **Framework**: Next.js 15 App Router (already scaffolded at `apps/web/`)
- **Database**: Supabase (Postgres, Auth, Storage, Realtime)
- **UI**: NerdsUI design token system (`@strategicnerds/nerdsui-web`)
- **Component library**: shadcn/ui (per NerdsUI conventions)
- **Styling**: Tailwind CSS with NerdsUI preset
- **Auth**: Supabase Auth (GitHub OAuth, email/password)
- **Payments**: Stripe
- **Export engine**: Puppeteer running on Vercel Functions (or dedicated worker)
- **Real-time**: Supabase Realtime (WebSocket channels for live presentations)
- **Hosting**: Vercel (web app), Supabase (database, storage, auth)
- **CI/CD**: GitHub Actions -> Vercel preview deployments, Supabase branch databases

### Project location

```
slide-nerds/
  apps/
    web/                    # slidenerds.com (this spec)
    supabase/               # Database schema, migrations, seed data
```

## Design system

### NerdsUI integration

Install `@strategicnerds/nerdsui-web` and use its Tailwind preset. All spacing, typography, radius, shadows, and colors come from NerdsUI tokens. Never hardcode values.

Create a new NerdsUI palette for slidenerds. Derive it from the app icon (green accent on dark background, consistent with the Supabase-inspired brand in the test deck).

### Palette

```
Primary: #3ECF8E (the slidenerds green -- matches app icon)
Background: #0A0A0A (near-black)
Surface: #141414
Surface elevated: #1E1E1E
Text: #EDEDED
Text secondary: rgba(237, 237, 237, 0.6)
Text tertiary: rgba(237, 237, 237, 0.4)
Border: rgba(255, 255, 255, 0.06)
Destructive: #EF4444
Success: #22C55E
Warning: #F59E0B
```

### Theme selector

Support light and dark themes. Dark is the default (matches the presentation aesthetic). Light is available for users who prefer it. The theme toggle lives in the dashboard header. Use NerdsUI's `useNerdsTheme` hook and CSS custom properties for theme switching.

### Components

Use shadcn/ui for all components (Button, Dialog, Input, Select, Table, Card, Tabs, etc.). Apply NerdsUI tokens via Tailwind classes. Never build custom components when shadcn/ui has one.

### Typography

Follow NerdsUI's typography scale:
- `displayLarge` for hero headings
- `headlineMedium` for page titles
- `titleSmall` for section labels
- `bodyLarge` for body text
- `labelMedium` for form labels
- `caption` for metadata

### Visual identity

The app icon lives at `/Users/prashant/Developer/sites/strategic-nerds/public/images/apps/slide-nerds.webp`. The web app's favicon and branding should match this icon. The green accent (#3ECF8E) is the primary action color throughout the dashboard.

## Pages and routes

### Marketing (public)

```
/                           Landing page
/pricing                    Pricing tiers
/docs                       Documentation (links to GitHub README)
/login                      Sign in (GitHub OAuth, email)
/signup                     Create account
/auth/callback              OAuth callback handler
```

### Dashboard (authenticated)

```
/dashboard                  My decks (grid view with thumbnails)
/dashboard/new              Create/link a new deck
/dashboard/settings         Account settings, billing, theme
/dashboard/team             Team management (Pro/Team tiers)
/dashboard/team/members     Invite/manage team members
```

### Deck management (authenticated)

```
/d/:slug                    View hosted deck (public or authenticated viewer)
/d/:slug/settings           Sharing, analytics, export settings
/d/:slug/analytics          View tracking data
/d/:slug/export             Export options (PDF, PPTX)
/d/:slug/versions           Version history
```

### Live presentation

```
/live/:sessionId            Audience view (real-time sync)
/live/:sessionId/presenter  Presenter controls + speaker notes
/live/:sessionId/poll/:id   Poll results (embedded in audience view)
```

### API routes

```
/api/auth/callback          Supabase Auth callback
/api/decks                  CRUD for decks
/api/decks/:id/push         Receive deck push from CLI
/api/decks/:id/export/pdf   Server-side PDF export
/api/decks/:id/export/pptx  Server-side PPTX export
/api/decks/:id/share        Create/manage share links
/api/decks/:id/analytics    Record view events
/api/live                   WebSocket upgrade for live sessions
/api/live/:sessionId/poll   Create/vote on polls
/api/stripe/webhook         Stripe payment webhook
/api/stripe/checkout        Create checkout session
/api/stripe/portal          Customer billing portal
```

## Data model

### Existing tables (already in migrations)

These tables already exist in `apps/supabase/migrations/00001_initial_schema.sql`:

- `profiles` (extends auth.users)
- `teams` and `team_members`
- `brand_configs`
- `decks` (basic, needs expansion)
- `deck_views` (basic, needs expansion)

### New/expanded tables

```sql
-- Expand decks table
alter table decks add column slug text unique;
alter table decks add column description text;
alter table decks add column slide_count int default 0;
alter table decks add column thumbnail_url text;
alter table decks add column is_public boolean default false;
alter table decks add column source_type text default 'push';  -- 'push' | 'url'
alter table decks add column source_url text;
alter table decks add column deployed_url text;
alter table decks add column version int default 1;

-- Share links
create table share_links (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references decks(id) on delete cascade,
  token text unique not null,
  access_type text not null default 'public',
  allowed_emails text[],
  allowed_domains text[],
  password_hash text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Slide snapshots (for thumbnails and export)
create table slide_snapshots (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references decks(id) on delete cascade,
  slide_index int not null,
  screenshot_path text,
  created_at timestamptz default now(),
  unique(deck_id, slide_index)
);

-- Expand deck_views for richer analytics
alter table deck_views add column share_link_id uuid references share_links(id);
alter table deck_views add column ip_hash text;
alter table deck_views add column user_agent text;
alter table deck_views add column total_time_seconds int;
alter table deck_views add column slides_viewed int[];

-- Live sessions
create table live_sessions (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references decks(id) on delete cascade,
  presenter_id uuid references auth.users(id),
  status text default 'active',
  current_slide int default 0,
  current_step int default 0,
  audience_count int default 0,
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- Polls
create table polls (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references live_sessions(id) on delete cascade,
  slide_index int,
  question text not null,
  options jsonb not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Poll votes
create table poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references polls(id) on delete cascade,
  voter_hash text not null,
  option_index int not null,
  created_at timestamptz default now(),
  unique(poll_id, voter_hash)
);

-- Audience reactions
create table reactions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references live_sessions(id) on delete cascade,
  type text not null,  -- 'thumbsup' | 'clap' | 'heart' | 'fire' | 'mind_blown'
  created_at timestamptz default now()
);

-- Deck versions (for version history)
create table deck_versions (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references decks(id) on delete cascade,
  version int not null,
  snapshot jsonb,  -- serialized deck metadata
  created_at timestamptz default now(),
  unique(deck_id, version)
);

-- Subscriptions
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free',  -- 'free' | 'pro' | 'team'
  status text default 'active',
  current_period_end timestamptz,
  created_at timestamptz default now()
);
```

### RLS policies

Every table gets RLS enabled. Auth context via `auth.uid()` in all policies. Service role never used in client-side code.

- `decks`: owner or team member can read/write. Public decks readable by anyone.
- `share_links`: deck owner can CRUD. Anyone can read (to validate tokens).
- `slide_snapshots`: deck owner can CRUD.
- `deck_views`: deck owner can read. Anyone can insert (anonymous tracking).
- `live_sessions`: presenter can CRUD. Audience can read active sessions.
- `polls`: presenter can CRUD. Audience can read active polls.
- `poll_votes`: anyone can insert (one vote per hash per poll). No reads except by presenter.
- `reactions`: anyone can insert. Presenter can read.
- `subscriptions`: user can read own. Service role for Stripe webhook writes.

## CLI integration

### Commands

```bash
slidenerds login              # Auth via browser OAuth flow
slidenerds logout             # Clear stored credentials
slidenerds link               # Associate current project with a deck on the service
slidenerds push               # Build and upload deck to slidenerds.com
slidenerds share [--public]   # Create/update share link
slidenerds export --pdf       # Server-side PDF export
slidenerds export --pptx      # Server-side PPTX export
slidenerds present            # Start a live session
slidenerds analytics          # View deck analytics in terminal
```

### Auth flow

`slidenerds login` opens a browser to `slidenerds.com/cli/auth`, which completes OAuth and returns a token. The CLI stores the token in `~/.slidenerds/credentials.json`. All subsequent API calls include this token as a Bearer header.

### Push flow

`slidenerds push` runs `next build` on the project, then uploads the built output to the service. The service hosts it at `slidenerds.com/d/:slug`. The slug is derived from the project name or set via `slidenerds link`.

## Server-side export

### PDF export

```
Client: POST /api/decks/:id/export/pdf
Server:
  1. Launch Puppeteer (headless Chrome)
  2. Set viewport to 1920x1080
  3. For each slide:
     a. Navigate to the hosted deck URL with ?slide=N&export=true
     b. The ?export=true query param triggers the runtime to:
        - Show all steps (force step-visible)
        - Hide controls, notes, Light Table
        - Disable animations
     c. Wait for networkidle0 + 500ms
     d. Take screenshot (PNG, full page)
  4. Assemble screenshots into PDF via jsPDF
  5. Return PDF as download
```

### PPTX export

Same screenshot pipeline, then assemble using pptxgenjs with images as slide backgrounds. Additionally, extract text from the DOM (via Puppeteer `page.evaluate`) and overlay as native PowerPoint text boxes for editability. Speaker notes extracted from `data-notes` elements.

### Export runtime flag

The runtime checks for `?export=true` in the URL and enters export mode:
- All `data-step` and `data-auto-step` elements get `step-visible` + inline style overrides
- All auto-build animations disabled
- Controls menu hidden
- Notes hidden
- Film grain pseudo-element hidden
- No keyboard handlers

This is added to the open-source runtime so it works for both self-hosted and service-hosted export.

## Live presentation

### Architecture

Supabase Realtime channels for low-latency sync.

```
Channel: live:{sessionId}
Events:
  slide_change    { slide: number, step: number }
  poll_start      { pollId: string, question: string, options: string[] }
  poll_vote       { pollId: string, optionIndex: number }
  poll_end        { pollId: string, results: number[] }
  reaction        { type: string }
  audience_join   { count: number }
  session_end     {}
```

### Presenter view

The presenter opens `slidenerds.com/live/:sessionId/presenter` which shows:
- Current slide with navigation
- Speaker notes
- Timer
- Audience count
- Poll controls (create, launch, end)
- Reaction feed

### Audience view

The audience opens `slidenerds.com/live/:sessionId` which shows:
- The current slide (synced in real time)
- Active poll (if any) with voting interface
- Reaction buttons (thumbs up, clap, heart, fire, mind blown)
- No navigation controls (presenter controls the pace)

## Pricing

| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 3 hosted decks, public sharing only, 5 exports/month, no live features |
| Pro | $12/month | Unlimited decks, restricted sharing (email/domain/password), unlimited exports, analytics, live presentations |
| Team | $29/month per seat | Everything in Pro + team workspace, shared brand configs, custom domain, priority export |

### Stripe integration

- Checkout via `@stripe/stripe-js` on the client
- Webhook at `/api/stripe/webhook` for subscription events
- Customer portal for billing management
- Metered usage tracking for export count (free tier)

## Development workflow

### Local development

```bash
cd apps/web
cp .env.local.example .env.local
# Start local Supabase
npx supabase start
# Generate types
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
# Start dev server
npm run dev
```

### Testing

TDD is non-negotiable. Write tests first.

- **Unit tests**: Vitest for utilities, hooks, and server functions
- **Component tests**: Vitest + React Testing Library
- **Integration tests**: Supabase local instance + test helpers
- **E2E tests**: Playwright for critical flows (login, push, share, export)

### CI/CD

#### GitHub Actions

```yaml
# .github/workflows/web.yml
on:
  push:
    paths: ['apps/web/**', 'apps/supabase/**']
  pull_request:
    paths: ['apps/web/**', 'apps/supabase/**']

jobs:
  test:
    - Checkout
    - Start local Supabase (via supabase-cli action)
    - npm ci
    - npm run typecheck
    - npm test
    - npx playwright test

  deploy-preview:
    needs: test
    if: github.event_name == 'pull_request'
    - Deploy to Vercel preview URL
    - Deploy Supabase branch database
    - Comment PR with preview URL

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    - Deploy to Vercel production
    - Run Supabase migrations on production
```

#### Vercel

- Preview deployments on every PR
- Production deployment on merge to main
- Environment variables managed via Vercel dashboard

#### Supabase

- Branch databases for PR previews (via Supabase branching)
- Migrations run automatically on deploy
- Production migrations gated behind CI test pass

## Build phases

### Phase 1: Foundation (week 1-2)

- [ ] Install NerdsUI, create slidenerds palette
- [ ] Set up shadcn/ui with NerdsUI preset
- [ ] Build auth flow (login, signup, OAuth callback)
- [ ] Build dashboard layout (header, sidebar, theme toggle)
- [ ] Build "My decks" page (empty state, list view)
- [ ] Generate Supabase types
- [ ] Set up GitHub Actions for web app
- [ ] Set up Vercel deployment
- [ ] Set up Supabase branch databases for previews

### Phase 2: Deck hosting (week 3-4)

- [ ] Build deck creation flow (link existing URL or push)
- [ ] Implement CLI `login`, `link`, `push` commands
- [ ] Build deck hosting (serve pushed decks at /d/:slug)
- [ ] Build deck settings page
- [ ] Build share link management (public, email, domain, password)
- [ ] Build deck viewer (public and authenticated)
- [ ] Implement `?export=true` mode in the open-source runtime

### Phase 3: Export (week 5)

- [ ] Build server-side PDF export via Puppeteer
- [ ] Build server-side PPTX export via Puppeteer + pptxgenjs
- [ ] Build export UI in deck settings
- [ ] Implement CLI `export` commands
- [ ] Rate limiting for free tier (5 exports/month)

### Phase 4: Analytics (week 6)

- [ ] Build view tracking (record slide views, dwell time)
- [ ] Build analytics dashboard page
- [ ] Build analytics API
- [ ] Implement CLI `analytics` command

### Phase 5: Live presentation (week 7-8)

- [ ] Build live session creation and management
- [ ] Build presenter view with real-time sync
- [ ] Build audience view with slide sync
- [ ] Build poll system (create, vote, results)
- [ ] Build reaction system
- [ ] Implement CLI `present` command

### Phase 6: Billing (week 8-9)

- [ ] Integrate Stripe checkout
- [ ] Build pricing page
- [ ] Build billing settings (portal, plan management)
- [ ] Implement tier enforcement (deck limits, export limits)
- [ ] Webhook handler for subscription events

### Phase 7: Polish (week 10)

- [ ] Landing page with product screenshots
- [ ] Custom domain support for Team tier
- [ ] Version history for decks
- [ ] Team workspace features
- [ ] Performance optimization
- [ ] Security audit (RLS, input validation, rate limiting)

## File structure

```
apps/web/
  src/
    app/
      (marketing)/              # Public pages (landing, pricing, docs)
        page.tsx                # Landing page
        pricing/page.tsx
        docs/page.tsx
      (auth)/                   # Auth pages
        login/page.tsx
        signup/page.tsx
        auth/callback/route.ts
      (dashboard)/              # Authenticated pages
        dashboard/
          page.tsx              # My decks
          new/page.tsx          # Create deck
          settings/page.tsx     # Account settings
          team/page.tsx         # Team management
        d/[slug]/
          page.tsx              # Deck viewer
          settings/page.tsx     # Deck settings
          analytics/page.tsx    # Deck analytics
          export/page.tsx       # Export options
      (live)/                   # Live presentation
        live/[sessionId]/
          page.tsx              # Audience view
          presenter/page.tsx    # Presenter view
      api/
        auth/callback/route.ts
        decks/route.ts
        decks/[id]/
          push/route.ts
          export/pdf/route.ts
          export/pptx/route.ts
          share/route.ts
          analytics/route.ts
        live/route.ts
        stripe/
          webhook/route.ts
          checkout/route.ts
          portal/route.ts
    components/
      layout/
        DashboardLayout.tsx
        MarketingLayout.tsx
        Header.tsx
        Sidebar.tsx
        ThemeToggle.tsx
      decks/
        DeckCard.tsx
        DeckGrid.tsx
        DeckSettings.tsx
        ShareDialog.tsx
        ExportDialog.tsx
      analytics/
        ViewChart.tsx
        SlideHeatmap.tsx
        ViewerTable.tsx
      live/
        PresenterControls.tsx
        AudienceView.tsx
        PollCard.tsx
        ReactionButton.tsx
        ReactionFeed.tsx
      billing/
        PricingCard.tsx
        PlanBadge.tsx
    lib/
      supabase/
        client.ts
        server.ts
        middleware.ts
        database.types.ts
      stripe/
        client.ts
        webhooks.ts
      export/
        pdf.ts                  # Puppeteer PDF export
        pptx.ts                 # Puppeteer + pptxgenjs PPTX export
      utils/
        slugify.ts
        rate-limit.ts
    hooks/
      use-deck.ts
      use-analytics.ts
      use-live-session.ts
      use-subscription.ts
```

## Quality gates

Before any PR merges:

- [ ] All tests pass (Vitest + Playwright)
- [ ] TypeScript strict mode satisfied
- [ ] No `any` types
- [ ] RLS policies tested with test helpers
- [ ] Lighthouse score above 90 (performance, accessibility)
- [ ] No hardcoded colors, spacing, or typography (NerdsUI tokens only)
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Dark and light theme tested

## Security

- RLS on every table, `auth.uid()` in all policies
- Service role key never in client-side code
- Rate limiting on export and live session endpoints
- Input validation on all API routes (Zod schemas)
- CORS configured for production domain only
- Stripe webhook signature verification
- Share link tokens are cryptographically random (uuid v4)
- Password-protected shares use bcrypt hashing
- No PII logged
- Export files stored temporarily in Supabase Storage (auto-deleted after 24 hours)
