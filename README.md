# slidenerds

A presentation runtime for Next.js and a skill library that teaches LLMs to build great slides.

Three things that work together:

**The runtime** (`@slidenerds/runtime`) turns any Next.js app into a full presentation environment. Navigation, speaker notes, Light Table with slide thumbnails, Magic Move transitions, step animations, SVG shape system, floating controls, URL sync, fullscreen.

**The skill library** (`skills/`) gives LLMs the procedural knowledge to build slides correctly. Layout alignment, animation sequencing, deck outlines, slide type patterns, speaker notes, brand application, analytics injection, export. The LLM reads these skills and acts on them.

**The CLI** (`npx slidenerds`) scaffolds new decks, exports to PDF/PPTX/Google Slides, and wires up analytics providers.

## Quick start

```bash
npx slidenerds create my-talk
cd my-talk
npm install
npm run dev
```

Open a second terminal, start Claude Code (or your preferred LLM), and talk to it while hot reload updates your browser.

## Repository structure

```
slidenerds/
  packages/
    runtime/               # @slidenerds/runtime npm package
    cli/                   # npx slidenerds CLI
  apps/
    web/                   # slidenerds.com (Next.js, Supabase, Vercel)
    supabase/              # Database schema, migrations, seed data
    ios/                   # Native iOS companion app
  skills/
    slidenerds-runtime/    # Core runtime conventions
    layout/                # Alignment, grids, arrangements
    animation/             # Step reveals, transitions
    slide-types/           # Title, big stat, quote, code, table, etc.
    deck-templates/        # Investor pitch, product launch, etc.
    speaker-notes/         # Speaker notes conventions
    brand/                 # Apply brand.config.ts, rebranding workflow
    visual-design/         # Layout, spacing, typography, composition rules
    analytics/             # GTM, GA4, PostHog, Plausible
    export/                # PDF, PPTX, Google Slides
```

## The runtime

Install in any Next.js app:

```bash
npm install @slidenerds/runtime
```

Wrap your layout:

```tsx
import { SlideRuntime } from '@slidenerds/runtime'

export default function RootLayout({ children }) {
  return <SlideRuntime>{children}</SlideRuntime>
}
```

### Data conventions

| Attribute | Purpose |
|-----------|---------|
| `data-slide` | Marks an element as a slide |
| `data-step` | Progressive reveal (hidden until clicked into view) |
| `data-notes` | Speaker notes (hidden in presentation, shown in speaker notes window) |
| `data-magic-id` | Shared identity for Magic Move transitions between slides |

### Keyboard controls

| Key | Action |
|-----|--------|
| Space / Right arrow | Next step or slide |
| Left arrow / Backspace | Previous step or slide |
| P | Speaker Notes (opens in a new window) |
| L | Light Table (slide thumbnail overview) |
| F | Fullscreen |
| Escape | Exit Light Table or fullscreen |

### Shape system

The `SlideShape` component renders SVG shapes that support text content, image masking, brand colors, and Magic Move transitions.

```tsx
import { SlideShape } from '@slidenerds/runtime'

<SlideShape shape="hexagon" size={100}
  fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth={1.5}>
  <p>Text inside</p>
</SlideShape>

<SlideShape shape="circle" size={140}
  imageSrc="/photo.jpg"
  stroke="var(--color-accent)" strokeWidth={2}
  data-magic-id="avatar" />
```

Available shapes: `circle`, `square`, `rounded-square`, `triangle`, `diamond`, `pentagon`, `hexagon`, `octagon`, `star`, `plus`, `cloud`, `arrow-right`, `arrow-left`, `chevron-right`, `pill`.

### Branding

Edit `brand.config.ts` to set your colors, fonts, and spacing. The layout injects these as CSS custom properties. One file change rebrands the entire deck. See the `brand` skill for details.

## The CLI

```bash
# Create a new deck
npx slidenerds create my-talk

# Export
npx slidenerds export --pdf
npx slidenerds export --pptx
npx slidenerds export --gslides

# Add analytics
npx slidenerds analytics --gtm GTM-XXXXXX
npx slidenerds analytics --ga4 G-XXXXXXXXXX
npx slidenerds analytics --posthog phc_XXXXXXXXXX
npx slidenerds analytics --plausible yourdomain.com
npx slidenerds analytics --custom
```

## The skill library

Install all skills:

```bash
npx skills add strategicnerds/slidenerds
```

Install a single skill:

```bash
npx skills add strategicnerds/slidenerds --skill layout
```

Skills follow the skills.sh `SKILL.md` format. Each skill is a directory with YAML frontmatter and markdown the agent reads when triggered.

## Local development

```bash
git clone https://github.com/strategicnerds/slidenerds.git
cd slidenerds
npm install
npm test
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (97 tests across packages and skills) |
| `npm run build` | Build all packages |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | TypeScript type checking |

### Project architecture

- **npm workspaces** for monorepo management
- **Vitest** for testing across all packages
- **TypeScript strict mode** everywhere
- Test files live next to the code they test (`foo.ts` and `foo.test.ts` in the same directory)

## Planned features

**Light Table reordering that persists to source**. The Light Table (press L) lets you drag slides into a new order, but the reorder only lasts for the session. It does not rewrite your source file. Persisting reorder requires a dev server API that parses the JSX AST, identifies `section[data-slide]` blocks, and rewrites them in the new order. This is planned but not yet built. Contributions welcome.

## What this is not

Not a slide editor. The LLM is the editor.

Not a slide host. Decks deploy to Vercel (or anywhere Next.js runs).

Not a content generator. The LLM and the user decide what goes in the deck. The skills make sure it looks right.
