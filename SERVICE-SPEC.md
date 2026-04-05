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

Use Supabase UI components (`@supabase/ui`) as the primary component library. Supplement with shadcn/ui where Supabase UI doesn't have a component. Apply NerdsUI tokens via Tailwind classes. Never build custom components when Supabase UI or shadcn/ui has one.

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

### Profile (authenticated)

```
/profile                    Profile page
```

**Profile page features:**
- Avatar upload (click to change, drag-and-drop, crop dialog)
  - Stored in Supabase Storage `avatars` bucket at `{user_id}/avatar.{ext}`
  - Public read, authenticated write (owner only)
  - Max file size: 2MB
  - Accepted formats: JPEG, PNG, WebP
  - Resized to 256x256 on upload (client-side before upload)
- Display name (editable inline)
- Email (read-only, from auth)
- Account created date
- Current plan badge (Free / Pro / Team)
- Theme preference (light / dark / system)
- Danger zone: delete account (confirmation dialog, cascading delete)

### Slides (authenticated)

```
/slides                     All my slide decks
/slides/[id]                A specific slide deck
/slides/[id]/settings       Deck settings (rename, sharing, danger zone)
/slides/[id]/analytics      View tracking for this deck
/slides/[id]/export         Export options (PDF, PPTX)
```

**`/slides` -- All my slide decks:**
- Grid of deck cards showing:
  - Thumbnail (slide 1 screenshot, or placeholder)
  - Deck name (editable via double-click or kebab menu)
  - Slide count
  - Last updated timestamp
  - Sharing status badge (Private / Public / Restricted)
  - Kebab menu: Rename, Duplicate, Share, Export, Delete
- Sort by: Last updated, Name, Created date
- Filter by: All, Public, Private, Shared with me
- Empty state: illustration + "Create your first deck" CTA with instructions
- "New deck" button in top-right (opens dialog with two options):
  - Link an existing deployed URL
  - Push from CLI (shows `slidenerds push` instructions)
- Search bar for deck name filtering
- Pagination or infinite scroll (25 decks per page)

**`/slides/[id]` -- A specific slide deck:**
- Full-width embedded viewer (the hosted slide runtime)
- Top bar with:
  - Back arrow to `/slides`
  - Deck name (editable inline)
  - Slide count
  - Share button (opens share dialog)
  - Export dropdown (PDF, PPTX)
  - Settings gear icon
  - Kebab menu: Duplicate, Delete
- Viewer shows the full slidenerds runtime (navigation, animations, Magic Move)
- Keyboard shortcuts work (arrow keys, space, P, L, F)

**`/slides/[id]/settings` -- Deck settings:**
- **General section:**
  - Deck name (text input)
  - Description (textarea, optional)
  - Slug (auto-generated from name, editable)
  - Thumbnail (auto-generated from slide 1, or manual upload)
- **Sharing section:**
  - Visibility toggle: Private / Public
  - Share link with copy button
  - Access restrictions (Pro/Team only):
    - Email allowlist (comma-separated input)
    - Domain allowlist (e.g., "@acme.com")
    - Password protection (set/change/remove)
  - Link expiration (optional date picker)
- **Danger zone:**
  - Delete deck (confirmation dialog: type deck name to confirm)
  - Transfer ownership (Team tier only)

**`/slides/[id]/analytics` -- Deck analytics:**
- Total views count
- Unique viewers count
- Average time spent
- Chart: views over time (line chart, last 30 days)
- Chart: time per slide (bar chart, which slides get most attention)
- Table: recent viewers (email if authenticated, "Anonymous" otherwise)
  - Columns: Viewer, Slides viewed, Time spent, Date
- All analytics data scoped to the deck owner via RLS

**`/slides/[id]/export` -- Export page:**
- Two cards side by side:
  - **Export as PDF**: description, "Export" button, shows progress, downloads file
  - **Export as PPTX**: description, "Export" button, shows progress, downloads file
- Export history (last 10 exports with download links, expire after 24h)
- Export count for free tier (X of 5 used this month)

### Team (authenticated, Pro/Team tier)

```
/team                       Team overview
/team/members               Manage team members
/team/billing               Team billing (Stripe portal)
```

**`/team` -- Team overview:**
- Team name (editable)
- Team slug
- Member count
- Shared brand configs
- Shared decks

**`/team/members` -- Manage members:**
- Table: Name, Email, Role (Owner/Admin/Member), Joined date
- Invite button (email input + role selector)
- Change role (dropdown per row, owner only)
- Remove member (confirmation dialog)

### Live presentation

```
/live/:sessionId            Audience view (real-time sync)
/live/:sessionId/presenter  Presenter controls + speaker notes
```

### Hosted deck viewer (public or restricted)

```
/d/:slug                    View a shared deck
```

- If public: renders immediately
- If restricted: shows auth gate (email input, password input, or "Sign in" button depending on access type)
- If expired: shows "This link has expired" message
- The viewer renders the full slidenerds runtime with navigation

### API routes

```
/api/auth/callback          Supabase Auth callback
/api/decks                  GET (list), POST (create)
/api/decks/[id]             GET, PATCH (rename, settings), DELETE
/api/decks/[id]/push        POST (receive deck push from CLI)
/api/decks/[id]/export/pdf  POST (server-side PDF export)
/api/decks/[id]/export/pptx POST (server-side PPTX export)
/api/decks/[id]/share       GET, POST, PATCH, DELETE (share links)
/api/decks/[id]/analytics   GET (read), POST (record view event)
/api/live                   POST (create live session)
/api/live/[sessionId]       GET (session info), DELETE (end session)
/api/live/[sessionId]/poll  POST (create poll), PATCH (end poll)
/api/live/[sessionId]/vote  POST (cast vote)
/api/stripe/webhook         POST (Stripe events)
/api/stripe/checkout        POST (create checkout session)
/api/stripe/portal          POST (create billing portal session)
/api/upload/avatar          POST (upload avatar to Supabase Storage)
```

## Supabase Storage buckets

### `avatars`

User profile avatars.

```sql
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Anyone can read (public bucket)
create policy "Public avatar read" on storage.objects
  for select using (bucket_id = 'avatars');

-- Users can upload their own avatar
create policy "Users upload own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatar
create policy "Users update own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
create policy "Users delete own avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

File path convention: `{user_id}/avatar.{ext}`

### `deck-thumbnails`

Auto-generated slide thumbnails for deck cards.

```sql
insert into storage.buckets (id, name, public) values ('deck-thumbnails', 'deck-thumbnails', true);

-- Anyone can read thumbnails (needed for shared decks)
create policy "Public thumbnail read" on storage.objects
  for select using (bucket_id = 'deck-thumbnails');

-- Deck owners can write thumbnails (via server-side export)
create policy "Service role writes thumbnails" on storage.objects
  for insert with check (bucket_id = 'deck-thumbnails')
  using (auth.role() = 'service_role');
```

File path convention: `{deck_id}/slide-{index}.png`

### `exports`

Temporary export files (PDF, PPTX). Auto-deleted after 24 hours.

```sql
insert into storage.buckets (id, name, public) values ('exports', 'exports', false);

-- Users can read their own exports
create policy "Users read own exports" on storage.objects
  for select using (
    bucket_id = 'exports'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Service role writes exports (via server-side export)
create policy "Service role writes exports" on storage.objects
  for insert with check (bucket_id = 'exports')
  using (auth.role() = 'service_role');
```

File path convention: `{user_id}/{deck_id}/{timestamp}.{pdf|pptx}`

### `deck-assets`

Images, logos, and other assets uploaded for use in decks.

```sql
insert into storage.buckets (id, name, public) values ('deck-assets', 'deck-assets', true);

-- Anyone can read (needed for hosted deck rendering)
create policy "Public asset read" on storage.objects
  for select using (bucket_id = 'deck-assets');

-- Deck owners can upload assets
create policy "Users upload own assets" on storage.objects
  for insert with check (
    bucket_id = 'deck-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own assets
create policy "Users delete own assets" on storage.objects
  for delete using (
    bucket_id = 'deck-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
```

File path convention: `{user_id}/{deck_id}/{filename}`

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
      (marketing)/                  # Public pages (no auth required)
        layout.tsx                  # Marketing layout (header + footer)
        page.tsx                    # Landing page
        pricing/page.tsx            # Pricing tiers
        docs/page.tsx               # Documentation
      (auth)/                       # Auth pages
        login/page.tsx              # Sign in
        signup/page.tsx             # Create account
        auth/callback/route.ts      # OAuth callback
      (app)/                        # Authenticated app pages
        layout.tsx                  # App layout (header + sidebar)
        profile/page.tsx            # Profile page (avatar, name, settings)
        slides/
          page.tsx                  # All my slide decks (grid)
          [id]/
            page.tsx                # View a specific deck (embedded runtime)
            settings/page.tsx       # Deck settings (rename, share, delete)
            analytics/page.tsx      # Deck analytics
            export/page.tsx         # Export options (PDF, PPTX)
        team/
          page.tsx                  # Team overview
          members/page.tsx          # Manage team members
          billing/page.tsx          # Team billing
      (viewer)/                     # Public/restricted deck viewer
        d/[slug]/page.tsx           # Hosted deck viewer
      (live)/                       # Live presentation
        live/[sessionId]/
          page.tsx                  # Audience view
          presenter/page.tsx        # Presenter view
      api/
        auth/callback/route.ts
        decks/route.ts              # GET (list), POST (create)
        decks/[id]/route.ts         # GET, PATCH, DELETE
        decks/[id]/push/route.ts    # POST (receive CLI push)
        decks/[id]/export/
          pdf/route.ts              # POST (server-side PDF)
          pptx/route.ts             # POST (server-side PPTX)
        decks/[id]/share/route.ts   # CRUD share links
        decks/[id]/analytics/route.ts
        live/route.ts               # POST (create session)
        live/[sessionId]/route.ts   # GET, DELETE
        live/[sessionId]/poll/route.ts
        live/[sessionId]/vote/route.ts
        upload/avatar/route.ts      # POST (avatar to Storage)
        stripe/
          webhook/route.ts
          checkout/route.ts
          portal/route.ts
    components/
      layout/
        AppHeader.tsx               # Dashboard header (logo, nav, avatar, theme toggle)
        AppSidebar.tsx              # Left sidebar (Slides, Profile, Team)
        MarketingHeader.tsx         # Public page header
        MarketingFooter.tsx         # Public page footer
        ThemeToggle.tsx             # Light/dark/system toggle
      profile/
        AvatarUpload.tsx            # Click-to-upload avatar with crop
        ProfileForm.tsx             # Display name, email, preferences
        DangerZone.tsx              # Delete account section
      slides/
        DeckCard.tsx                # Card for deck grid (thumbnail, name, badge)
        DeckGrid.tsx                # Grid layout for deck cards
        DeckEmptyState.tsx          # Empty state illustration + CTA
        NewDeckDialog.tsx           # Create deck dialog (link URL or push)
        RenameDialog.tsx            # Inline rename dialog
        DeleteDeckDialog.tsx        # Confirmation dialog (type name to confirm)
        ShareDialog.tsx             # Sharing settings (visibility, links, restrictions)
        ExportCard.tsx              # Export option card (PDF or PPTX)
      analytics/
        ViewsOverTimeChart.tsx      # Line chart (last 30 days)
        TimePerSlideChart.tsx       # Bar chart (dwell time per slide)
        ViewerTable.tsx             # Recent viewers table
        StatCard.tsx                # Total views, unique viewers, avg time
      live/
        PresenterControls.tsx       # Slide nav, notes, timer, audience count
        AudienceSlideView.tsx       # Real-time synced slide viewer
        PollCreator.tsx             # Create poll form
        PollVoter.tsx               # Vote interface for audience
        PollResults.tsx             # Live results bar chart
        ReactionButton.tsx          # Emoji reaction button
        ReactionFeed.tsx            # Floating reactions overlay
      billing/
        PricingCard.tsx             # Plan card (features, price, CTA)
        PlanBadge.tsx               # Free / Pro / Team badge
        UsageMeter.tsx              # Export usage for free tier
      shared/
        PageHeader.tsx              # Consistent page header (title, description, actions)
        ConfirmDialog.tsx           # Reusable confirmation dialog
        CopyButton.tsx              # Click-to-copy with feedback
        SearchInput.tsx             # Debounced search input
        SortSelect.tsx              # Sort dropdown
    lib/
      supabase/
        client.ts                   # Browser client
        server.ts                   # Server client
        middleware.ts               # Auth middleware
        database.types.ts           # Generated from schema
        storage.ts                  # Storage bucket helpers (upload, getUrl, delete)
      stripe/
        client.ts                   # Stripe client
        webhooks.ts                 # Webhook event handlers
      export/
        pdf.ts                      # Puppeteer PDF export
        pptx.ts                     # Puppeteer + pptxgenjs PPTX export
      utils/
        slugify.ts                  # Name to URL slug
        rate-limit.ts               # API rate limiting
        image-resize.ts             # Client-side image resize for avatars
    hooks/
      use-deck.ts                   # Deck CRUD operations
      use-decks.ts                  # List/filter/sort decks
      use-profile.ts                # Profile read/update
      use-avatar.ts                 # Avatar upload/delete
      use-analytics.ts              # Deck analytics data
      use-live-session.ts           # Live session state
      use-subscription.ts           # Current plan, limits
      use-share-link.ts             # Share link management
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
