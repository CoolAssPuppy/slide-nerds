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
    advanced-layouts/      # Dashboard, comparison, logo wall, before/after
    visual-design/         # Typography scale, spacing, composition rules
    animation/             # Step reveals, Magic Move, transitions
    slide-types/           # Title, big stat, quote, code, table, etc.
    data-visualization/    # 13 chart types with Recharts
    strategic-frameworks/  # SWOT, 2x2, TAM/SAM/SOM, chevrons, pyramid
    diagrams/              # Flowcharts, org charts, sequence, journey, Venn
    narrative-frameworks/  # SCQA, Minto Pyramid, PAS, BAB, Sparkline
    deck-templates/        # Investor pitch, product launch, etc.
    brand/                 # brand.config.ts, rebranding workflow
    speaker-notes/         # Speaker notes conventions
    accessibility/         # WCAG contrast, motion reduction, screen reader
    interactive/           # Video, QR codes, links, iframes, polls
    react-component-embeds/ # Embed real React components and live demos in slides
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

### CSS variables

These are set by `brand.config.ts` via the layout and available in every slide:

| Variable | Usage |
|----------|-------|
| `--color-primary` | Section divider backgrounds, darkest surfaces |
| `--color-accent` | Highlights, stats, labels, shape strokes, chart fills |
| `--color-background` | Slide canvas background |
| `--color-surface` | Card backgrounds (charts, tables, code blocks) |
| `--color-text` | Primary text color |
| `--slide-padding` | Outer slide padding |
| `--font-heading` | Heading font stack |
| `--font-body` | Body text font stack |
| `--font-mono` | Monospace font stack |

Derived variables (set in `globals.css`):

| Variable | Usage |
|----------|-------|
| `--color-accent-dim` | Pill backgrounds, badges, shape fills (accent at 12% opacity) |
| `--color-text-secondary` | Body text, descriptions (text at 60% opacity) |
| `--color-text-tertiary` | Captions, metadata (text at 40% opacity) |
| `--color-border` | Card borders, dividers, table rules (white at 6% opacity) |
| `--color-surface-elevated` | Table headers, elevated cards |

### Animation classes

Add to `data-step` elements for entrance animations:

| Class | Effect | Duration |
|-------|--------|----------|
| `step-fade` | Opacity 0 to 1 | 350ms |
| `step-move-up` | Slide up 24px + fade | 420ms |
| `step-scale-in` | Scale 0.92 to 1 + fade | 350ms |
| `step-emphasis` | Spring scale entrance | 500ms |

### Utility CSS classes

| Class | What it does |
|-------|-------------|
| `section-label` | Small uppercase accent-colored text with wide tracking |
| `card-surface` | Rounded container with surface background and subtle border |
| `accent-line` | 40x3px decorative accent line |
| `stat-glow` | Text shadow glow in accent color for large numbers |
| `bg-mesh-warm` | Subtle warm radial gradient background |
| `bg-mesh-cool` | Subtle cool radial gradient background |
| `bg-section` | Linear gradient for section divider slides |
| `slide-table` | Styled table with uppercase headers and border rules |
| `timeline-track` | Horizontal connector line for timelines |
| `timeline-dot` | Accent circle with glow for timeline nodes |
| `sr-only` | Visually hidden, screen-reader accessible |

### What can go on a slide

Every slide is a `<section data-slide="">`. Inside it, you can use:

- **Text**: headings, paragraphs, lists, blockquotes with Tailwind typography classes
- **Images**: `<img>` with `object-cover` or `object-contain`
- **Charts**: Recharts components (bar, line, area, pie, radar, scatter, combo, treemap, funnel) inside `card-surface` containers with fixed-height `ResponsiveContainer`
- **Shapes**: `SlideShape` component with 16 SVG shape types, supporting text content, image masking, and Magic Move
- **Tables**: HTML tables with `slide-table` class, rows revealed progressively via `data-step`
- **Diagrams**: Mermaid charts (flowcharts, sequence, journey, mind map, state, C4) or custom SVG (Venn, cycle, swim lane)
- **Video**: YouTube/Vimeo iframes or `<video>` in `card-surface` with 16:9 aspect ratio
- **QR codes**: `qrcode.react` component for audience links
- **Links**: Styled as pill buttons with external-link icon
- **Strategic frameworks**: SWOT, 2x2 matrix, TAM/SAM/SOM, process chevrons, pyramid, risk matrix (all HTML/CSS)
- **Custom SVG**: Gauge charts, Venn diagrams, cycle diagrams, any visualization not covered above
- **React components**: Any reusable component from your Next.js app, including live demos with local state and event handlers

### Embedding React components in slides

Slides are standard React/Next.js UI. If a component works in your app, it can be rendered inside a slide.

```tsx
import { ProductSearchDemo } from '@/components/product-search-demo'

<section data-slide="">
  <div className="flex flex-col w-full" style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Live demo</p>
    <h2 className="text-[2.5rem] font-bold mb-8">Search UX in production</h2>
    <ProductSearchDemo />
  </div>
</section>
```

Use the `react-component-embeds` skill when you want a repeatable pattern for integrating interactive demos into slides.

### Slide layout patterns

The default layout is **top-left anchored**. Title and content start near the top and flow downward. Do NOT vertically center content on most slides. Centered layout is only for big stat, section divider, quote, and closing slides.

```tsx
{/* TOP-LEFT WITH TEXT (bullets, lists, tables -- content anchored below title) */}
<section data-slide="">
  <div className="bg-mesh-cool flex flex-col w-full"
    style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Section name</p>
    <h2 className="text-[2.5rem] font-bold mb-10">Slide title</h2>
    {/* Text content flows downward. Bottom is breathing room. */}
  </div>
</section>

{/* TOP-LEFT TITLE + CENTERED VISUAL (diagrams, charts, shapes, process flows) */}
<section data-slide="">
  <div className="flex flex-col w-full"
    style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Section name</p>
    <h2 className="text-[2.5rem] font-bold mb-8">Slide title</h2>
    <div className="flex-1 flex items-center justify-center">
      {/* Visual centered in remaining space below the title */}
    </div>
  </div>
</section>

{/* CENTERED (only for: big stat, section divider, quote, closing) */}
<section data-slide="">
  <div className="flex flex-col items-center justify-center w-full">
    {/* Content centered horizontally and vertically */}
  </div>
</section>

{/* BOTTOM-ALIGNED (only for: title slide) */}
<section data-slide="">
  <div className="flex flex-col justify-end w-full"
    style={{ padding: '5rem 5.5rem' }}>
    {/* Content anchored to bottom-left. Top 55% is empty. */}
  </div>
</section>

{/* TWO-COLUMN SPLIT (before/after, quote + data) */}
<section data-slide="">
  <div className="grid grid-cols-2 w-full">
    <div style={{ padding: '4rem' }}>{/* Left */}</div>
    <div style={{ padding: '4rem' }}>{/* Right */}</div>
  </div>
</section>
```

### Magic Move

Give elements the same `data-magic-id` on consecutive slides. The runtime applies a clean cross-slide entrance animation for the matching element on the next slide.

```tsx
{/* Slide A: large centered metrics */}
<section data-slide="">
  <div data-magic-id="revenue" className="text-6xl">$4.2M</div>
</section>

{/* Slide B: same metric, small, top-left -- runtime animates the move */}
<section data-slide="">
  <div data-magic-id="revenue" className="text-xl">$4.2M</div>
  <div data-step="" className="step-fade">{/* New content below */}</div>
</section>
```

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
| `npm test` | Run all tests (125 tests across packages and skills) |
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
