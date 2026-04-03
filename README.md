# slidenerds

A presentation runtime for Next.js and a skill library that teaches LLMs to build great slides.

Three things that work together:

**The runtime** (`@slidenerds/runtime`) turns any Next.js app into a full presentation environment. Navigation, presenter mode, speaker notes, timer, light table view, URL sync, fullscreen.

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
  skills/
    slidenerds-runtime/    # Core runtime conventions
    layout/                # Alignment, grids, arrangements
    animation/             # Step reveals, transitions
    slide-types/           # Title, big stat, quote, code, table, etc.
    deck-templates/        # Investor pitch, product launch, etc.
    speaker-notes/         # Speaker notes conventions
    brand/                 # Apply brand.config.ts
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
| `data-notes` | Speaker notes (hidden in presentation, shown in presenter mode) |

### Keyboard controls

| Key | Action |
|-----|--------|
| Space / Right arrow | Next step or slide |
| Left arrow / Backspace | Previous step or slide |
| P | Presenter mode |
| L | Light table |
| F | Fullscreen |
| Escape | Exit fullscreen |

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
| `npm test` | Run all tests (92 tests across packages and skills) |
| `npm run build` | Build all packages |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | TypeScript type checking |

### Project architecture

- **npm workspaces** for monorepo management
- **Vitest** for testing across all packages
- **TypeScript strict mode** everywhere
- Test files live next to the code they test (`foo.ts` and `foo.test.ts` in the same directory)

## What this is not

Not a slide editor. The LLM is the editor.

Not a slide host. Decks deploy to Vercel (or anywhere Next.js runs).

Not a content generator. The LLM and the user decide what goes in the deck. The skills make sure it looks right.
