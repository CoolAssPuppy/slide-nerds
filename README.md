# slide-nerds

A presentation runtime for Next.js, a skill library that teaches LLMs to build great slides, and a hosted service for sharing and analytics.

**The runtime** turns any Next.js app into a full presentation environment. Navigation, speaker notes, Light Table, Magic Move transitions, step animations, SVG shapes, fullscreen, keyboard controls.

**The skill library** gives LLMs the procedural knowledge to build slides correctly. 19 skills covering layout, animation, data visualization, strategic frameworks, narrative structure, diagrams, live presentation components, accessibility, and more.

**The CLI** scaffolds new decks, pushes them to slidenerds.com, manages brand configs, and exports to PDF and PPTX.

**The service** at slidenerds.com hosts your decks with shareable URLs, view analytics, access controls, team workspaces, brand management, live presentations, and server-side export.

## Quick start

```bash
slidenerds create my-talk
cd my-talk
npm install
npm run dev
```

Open a second terminal, start Claude Code (or your preferred LLM), and talk to it while hot reload updates your browser.

## Register with slidenerds.com

Deploy your deck to Vercel, Netlify, or any static host, then register the URL:

```bash
npx vercel deploy --prod

slidenerds login
slidenerds link --name my-talk --url https://my-talk.vercel.app
```

Your deck is now registered at `slidenerds.com/d/my-talk` with analytics, sharing controls, and export.

## What you get

When you run `create`, you get:

```
my-talk/
  app/
    layout.tsx          # Root layout with SlideRuntime + brand wiring
    page.tsx            # Your slides
    globals.css         # Slide engine CSS, animations, utility classes
  brand.config.ts       # Colors, fonts, spacing (single source of truth)
  CLAUDE.md             # Complete slide authoring guide for LLMs
  .slidenerds/
    skills/             # 19 LLM skill files installed locally
```

## The runtime

Install in any Next.js app:

```bash
npm install @strategicnerds/slide-nerds
```

Wrap your layout:

```tsx
import { SlideRuntime } from '@strategicnerds/slide-nerds'
import brandConfig from '../brand.config'

const brandVars = {
  '--color-primary': brandConfig.colors.primary,
  '--color-accent': brandConfig.colors.accent,
  '--color-background': brandConfig.colors.background,
  '--color-surface': brandConfig.colors.surface,
  '--color-text': brandConfig.colors.text,
  '--slide-padding': brandConfig.spacing.slide,
  '--font-heading': brandConfig.fonts.heading,
  '--font-body': brandConfig.fonts.body,
  '--font-mono': brandConfig.fonts.mono,
} as React.CSSProperties

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={brandVars}>
      <body>
        <SlideRuntime>{children}</SlideRuntime>
      </body>
    </html>
  )
}
```

Write slides:

```tsx
export default function Home() {
  return (
    <main>
      <section data-slide="">
        <div style={{ padding: 'var(--slide-padding)' }}>
          <h1 className="text-6xl font-bold">My talk</h1>
          <p className="mt-4 text-xl opacity-60">Subtitle</p>
        </div>
      </section>

      <section data-slide="">
        <div style={{ padding: 'var(--slide-padding)' }}>
          <h2 className="text-4xl font-bold mb-10">Key point</h2>
          <ul>
            <li data-step="" className="step-fade">First thing</li>
            <li data-step="" className="step-fade">Second thing</li>
          </ul>
          <div data-notes="">Speaker notes go here.</div>
        </div>
      </section>
    </main>
  )
}
```

### Data attributes

| Attribute | Purpose |
|-----------|---------|
| `data-slide` | Marks an element as a slide |
| `data-step` | Progressive reveal (hidden until presenter advances) |
| `data-notes` | Speaker notes (hidden in presentation, shown in presenter mode) |
| `data-magic-id` | Shared identity for Magic Move transitions between slides |

### Keyboard controls

| Key | Action |
|-----|--------|
| Space / Right arrow | Next step or slide |
| Left arrow / Backspace | Previous step or slide |
| P | Presenter mode (notes, timer, preview) |
| L | Light Table (slide thumbnail overview) |
| F | Fullscreen |
| ? | Show keyboard shortcuts |
| Escape | Exit Light Table or fullscreen |

### Embed any React component

Slides are React components. Import and render anything:

```tsx
import { PricingCalculator } from '../components/PricingCalculator'

<section data-slide="">
  <PricingCalculator initialPlan="pro" />
</section>
```

Live demos, interactive charts, product features -- if it runs in React, it runs in your slide. Use Remotion, Three.js, or any library for cinematic animations.

### Live presentation components

Five components for real-time audience interaction during live presentations. These connect to slidenerds.com and require a hosted deck with an active live session.

```tsx
import { LivePoll, LiveReactions, LiveQA, LiveAudienceCount, LiveWordCloud } from '@strategicnerds/slide-nerds'

<section data-slide="">
  <LivePoll
    question="What is your biggest challenge?"
    options={['Speed', 'Reliability', 'Cost', 'Complexity']}
  />
</section>

<section data-slide="">
  <LiveQA />
  <LiveReactions />
</section>

<section data-slide="">
  <LiveWordCloud prompt="Describe your experience in one word" />
  <LiveAudienceCount />
</section>
```

Each component accepts optional `sessionId` and `serviceUrl` props. For local dev, pass `serviceUrl="http://localhost:3000"`.

### Shape system

```tsx
import { SlideShape } from '@strategicnerds/slide-nerds'

<SlideShape shape="hexagon" size={100}
  fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth={1.5}>
  <p>Text inside</p>
</SlideShape>
```

18 shapes: `circle`, `square`, `rounded-square`, `triangle`, `diamond`, `pentagon`, `hexagon`, `octagon`, `star`, `plus`, `cloud`, `arrow-right`, `arrow-left`, `chevron-right`, `pill`.

### Branding

Edit `brand.config.ts` to set colors, fonts, and spacing. One file change rebrands the entire deck.

```typescript
export default {
  colors: {
    primary: '#0d0d0f',
    accent: '#f59e0b',
    background: '#111114',
    surface: '#1a1a1f',
    text: '#e8e6e3',
  },
  fonts: {
    heading: '"Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  spacing: { slide: '5rem', section: '2rem', element: '1rem' },
}
```

Save and sync brand configs with the service:

```bash
slidenerds brand set "My Brand"    # Upload current brand.config.ts
slidenerds brand get "My Brand"    # Download and apply a saved brand
slidenerds brand list              # List all saved brands
```

## The skill library

19 skills installed to `.slidenerds/skills/` when you create a deck:

| Skill | What it covers |
|-------|---------------|
| `layout` | Alignment, grids, centering, two-up, hero+body |
| `advanced-layouts` | Dashboard, pricing, before/after, icon grid, logo wall |
| `animation` | Step reveals, Magic Move, transition overlays, emphasis |
| `brand` | brand.config.ts wiring, palette derivation, font pairing |
| `data-visualization` | 13 chart types with Recharts |
| `deck-templates` | Slide sequences for investor pitch, product launch, sales deck |
| `diagrams` | Flowcharts, org charts, sequence diagrams, mind maps, C4 |
| `export` | PDF, PPTX, Google Slides export |
| `interactive` | Video embeds, QR codes, links, iframes, click-to-zoom |
| `live` | Live polls, reactions, Q&A, word clouds, audience count |
| `narrative-frameworks` | SCQA, Minto Pyramid, PAS, BAB, Sparkline |
| `react-component-embeds` | Embedding React components in slides |
| `slide-types` | Title, big stat, quote, code, table, chart, timeline |
| `slidenerds-runtime` | Runtime API and data attributes |
| `speaker-notes` | Speaker notes conventions |
| `strategic-frameworks` | SWOT, 2x2 matrix, TAM/SAM/SOM, process chevrons |
| `visual-design` | Typography scale, spacing, composition |
| `analytics` | View tracking and analytics setup |
| `accessibility` | WCAG contrast, prefers-reduced-motion, screen reader support |

## The CLI

```bash
# Create and develop
slidenerds create my-talk         # Scaffold a new deck
slidenerds export --pdf           # Export to PDF
slidenerds export --pptx          # Export to PowerPoint

# Register on slidenerds.com
slidenerds login                  # Authenticate with the service
slidenerds link --name my-talk --url https://my-talk.vercel.app

# Brand management
slidenerds brand set "My Brand"   # Save current brand to service
slidenerds brand get "My Brand"   # Apply a saved brand to this deck
slidenerds brand list             # List all saved brands

# Analytics providers (optional, for third-party tracking)
slidenerds analytics --gtm GTM-XXXXXX
slidenerds analytics --ga4 G-XXXXXXXXXX
```

## The service (slidenerds.com)

Push your deck and get:

- **Hosted URL** at `slidenerds.com/d/your-deck`
- **View analytics** with per-slide dwell time, unique viewers, and trends
- **Access controls** -- private by default, with email, domain, password, and expiring share links
- **Team workspaces** with shared decks and brand configs
- **Custom domains** with automatic SSL
- **Live presentations** with real-time slide sync, polls, reactions, Q&A
- **Server-side export** to PDF and PPTX from the web UI
- **Version history** with rollback to any previous push
- **Comments** for slide-level feedback from reviewers

Free for unlimited public decks. Pro ($4/mo) adds private decks and full analytics. Team ($9/seat/mo) adds workspaces, brand configs, and custom domains.

## Repository structure

```
slide-nerds/
  packages/
    slide-nerds/           # @strategicnerds/slide-nerds (the npm package)
      src/
        runtime/           # React components + live components
        cli/               # CLI (slidenerds command)
      templates/           # Scaffold templates
      skills/              # 19 SKILL.md files (bundled in package)
  skills/                  # Source skills (development copies)
  apps/
    web/                   # slidenerds.com (Next.js 15, Supabase, Vercel)
    supabase/              # Database schema, migrations, seed data, email templates
    ios/                   # Native iOS companion app
```

## Local development

```bash
git clone https://github.com/strategicnerds/slide-nerds.git
cd slide-nerds
npm install
npm test
```

| Command | Description |
|---------|-------------|
| `npm test` | Run all 249 tests |
| `npm run build` | Build all packages |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |

### Running the web app locally

```bash
cd apps/web
doppler run -- npm run dev
```

### Testing a local build

```bash
cd packages/slide-nerds
npm run build
npm link

# In another directory:
slidenerds create test-deck
cd test-deck
npm link @strategicnerds/slide-nerds
npm install
npm run dev
```

## License

MIT
