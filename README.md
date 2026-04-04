# slide-nerds

A presentation runtime for Next.js and a skill library that teaches LLMs to build great slides.

Three things in one package:

**The runtime** turns any Next.js app into a full presentation environment. Navigation, speaker notes, Light Table with slide thumbnails, Magic Move transitions, step animations, SVG shape system, floating controls, URL sync, fullscreen.

**The skill library** gives LLMs the procedural knowledge to build slides correctly. 18 skills covering layout, animation, data visualization, strategic frameworks, narrative structure, diagrams, accessibility, and more. The LLM reads these skills and acts on them.

**The CLI** scaffolds new decks and wires up analytics providers.

## Quick start

```bash
npx @strategicnerds/slide-nerds create my-talk
cd my-talk
npm install
npm run dev
```

Open a second terminal, start Claude Code (or your preferred LLM), and talk to it while hot reload updates your browser. The generated `CLAUDE.md` tells the LLM everything it needs to know.

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
    skills/             # 18 LLM skill files installed locally
      animation/
      brand/
      data-visualization/
      diagrams/
      ...
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
        <div className="flex flex-col justify-end" style={{ padding: '5rem' }}>
          <h1 className="text-6xl font-bold">My talk</h1>
          <p className="mt-4 text-xl opacity-60">Subtitle</p>
        </div>
      </section>

      <section data-slide="">
        <div className="flex flex-col" style={{ padding: '4rem 6rem' }}>
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
| `data-notes` | Speaker notes (hidden in presentation, shown in Speaker Notes window) |
| `data-magic-id` | Shared identity for Magic Move transitions between slides |

### Keyboard controls

| Key | Action |
|-----|--------|
| Space / Right arrow | Next step or slide |
| Left arrow / Backspace | Previous step or slide |
| P | Speaker Notes (opens new window) |
| L | Light Table (slide thumbnail overview) |
| F | Fullscreen |
| Escape | Exit Light Table or fullscreen |

### Shape system

```tsx
import { SlideShape } from '@strategicnerds/slide-nerds'

// Shape with text
<SlideShape shape="hexagon" size={100}
  fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth={1.5}>
  <p>Text inside</p>
</SlideShape>

// Shape with image mask
<SlideShape shape="circle" size={140}
  imageSrc="/photo.jpg"
  stroke="var(--color-accent)" strokeWidth={2}
  data-magic-id="avatar" />
```

16 shapes: `circle`, `square`, `rounded-square`, `triangle`, `diamond`, `pentagon`, `hexagon`, `octagon`, `star`, `plus`, `cloud`, `arrow-right`, `arrow-left`, `chevron-right`, `pill`.

### Branding

Edit `brand.config.ts` to set your colors, fonts, and spacing. The layout injects these as CSS custom properties. One file change rebrands the entire deck.

### CSS variables

Set by `brand.config.ts` via the layout:

| Variable | Usage |
|----------|-------|
| `--color-primary` | Section divider backgrounds, darkest surfaces |
| `--color-accent` | Highlights, stats, shape strokes, chart fills |
| `--color-background` | Slide canvas background |
| `--color-surface` | Card backgrounds (charts, tables) |
| `--color-text` | Primary text color |
| `--slide-padding` | Outer slide padding |
| `--font-heading` | Heading font stack |
| `--font-body` | Body text font stack |
| `--font-mono` | Monospace font stack |

Derived variables (set in `globals.css`):

| Variable | Usage |
|----------|-------|
| `--color-accent-dim` | Accent at 12% opacity (badges, pill backgrounds) |
| `--color-text-secondary` | Text at 60% opacity (body, labels) |
| `--color-text-tertiary` | Text at 40% opacity (captions, metadata) |
| `--color-border` | White at 6% opacity (card borders, dividers) |
| `--color-surface-elevated` | One step above surface (table headers) |

### Animation classes

| Class | Effect | Duration |
|-------|--------|----------|
| `step-fade` | Opacity 0 to 1 | 350ms |
| `step-move-up` | Slide up 24px + fade | 420ms |
| `step-scale-in` | Scale 0.92 to 1 + fade | 350ms |
| `step-emphasis` | Spring scale entrance | 500ms |

### Utility CSS classes

| Class | Purpose |
|-------|---------|
| `section-label` | Small uppercase accent-colored label |
| `card-surface` | Rounded container with surface background |
| `accent-line` | 40x3px decorative accent line |
| `stat-glow` | Text shadow glow for large numbers |
| `bg-mesh-warm` | Subtle warm radial gradient |
| `bg-mesh-cool` | Subtle cool radial gradient |
| `bg-section` | Linear gradient for section dividers |
| `slide-table` | Table with uppercase headers |
| `timeline-track` | Horizontal connector line |
| `timeline-dot` | Accent circle with glow |
| `sr-only` | Visually hidden, screen-reader accessible |

### Slide layout patterns

The default layout is **top-left anchored**. Do NOT vertically center content on most slides.

**Two sub-types:**
- **Top-left text** (bullets, tables): Content anchored below title, flows down.
- **Top-left + centered visual** (charts, diagrams, shapes, timelines, KPIs): Title top-left, visual centered in remaining space using `flex-1 flex items-center justify-center`.

Only big stat, section divider, quote, and closing use centered layout.

```tsx
{/* TOP-LEFT TEXT (default) */}
<section data-slide="">
  <div className="flex flex-col" style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Section</p>
    <h2 className="text-[2.5rem] font-bold mb-10">Title</h2>
    {/* Content flows down */}
  </div>
</section>

{/* TOP-LEFT + CENTERED VISUAL (charts, diagrams, shapes) */}
<section data-slide="">
  <div className="flex flex-col" style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Section</p>
    <h2 className="text-[2.5rem] font-bold mb-8">Title</h2>
    <div className="flex-1 flex items-center justify-center">
      {/* Chart, diagram, or shapes centered in remaining space */}
    </div>
  </div>
</section>

{/* CENTERED (only: big stat, section divider, quote, closing) */}
<section data-slide="">
  <div className="flex flex-col items-center justify-center">
    {/* Content centered */}
  </div>
</section>
```

### Magic Move

Give elements the same `data-magic-id` on consecutive slides. The runtime animates position and scale between them.

```tsx
{/* Slide A: large centered */}
<section data-slide="">
  <div data-magic-id="revenue" className="text-6xl">$4.2M</div>
</section>

{/* Slide B: small top-left -- runtime animates the move */}
<section data-slide="">
  <div data-magic-id="revenue" className="text-xl">$4.2M</div>
</section>
```

### Content types

Everything that can go on a slide:

- **Text**: headings, paragraphs, lists, blockquotes
- **Images**: `<img>` with `object-cover` or `object-contain`
- **Charts**: Recharts (bar, line, area, pie, radar, scatter, combo, waterfall, funnel, gauge, sparkline, treemap)
- **Shapes**: SlideShape (16 SVG shapes with text or image content)
- **Tables**: HTML tables with `slide-table` class
- **Diagrams**: Mermaid (flowcharts, sequence, journey, mind map, state, C4) or custom SVG
- **Video**: YouTube/Vimeo iframes or `<video>`
- **QR codes**: `qrcode.react`
- **Strategic frameworks**: SWOT, 2x2 matrix, TAM/SAM/SOM, process chevrons, pyramid, risk matrix
- **Custom SVG**: Venn diagrams, gauge charts, cycle diagrams

## The skill library

18 skills installed to `.slidenerds/skills/` when you create a deck:

| Skill | What it covers |
|-------|---------------|
| `narrative-frameworks` | SCQA, Minto Pyramid, PAS, BAB, Sparkline, Monroe's, Rule of Three |
| `deck-templates` | Slide sequences for investor pitch, product launch, board deck, sales deck, conference talk |
| `visual-design` | Typography scale, spacing, composition, content density |
| `brand` | brand.config.ts wiring, palette derivation, font pairing, rebranding workflow |
| `layout` | Alignment, grids, centering, two-up, hero+body |
| `advanced-layouts` | Dashboard, pricing comparison, before/after, icon grid, logo wall, agenda, appendix |
| `slide-types` | Title, big stat, quote, code, table, chart, team, timeline, image, two-up |
| `data-visualization` | 13 chart types with Recharts (bar, line, area, pie, radar, waterfall, funnel, gauge, sparkline, combo, treemap) |
| `strategic-frameworks` | SWOT, 2x2 matrix, TAM/SAM/SOM, process chevrons, pyramid, risk matrix, maturity model |
| `diagrams` | Flowcharts, org charts, sequence diagrams, journey maps, mind maps, C4, Venn, swim lanes |
| `narrative-frameworks` | SCQA, Minto Pyramid, PAS, BAB, Sparkline, Monroe's Motivated Sequence |
| `animation` | Step reveals, Magic Move, transition overlays, emphasis |
| `interactive` | Video embeds, QR codes, links, iframes, click-to-zoom, polls |
| `accessibility` | WCAG contrast, prefers-reduced-motion, screen reader support, color-blind palettes |
| `speaker-notes` | Speaker notes conventions |
| `analytics` | GTM, GA4, PostHog, Plausible integration |
| `export` | PDF, PPTX, Google Slides export |
| `react-component-embeds` | Embedding React components in slides |

## The CLI

```bash
# Create a new deck
npx @strategicnerds/slide-nerds create my-talk

# Add analytics
slidenerds analytics --gtm GTM-XXXXXX
slidenerds analytics --ga4 G-XXXXXXXXXX
slidenerds analytics --posthog phc_XXXXXXXXXX
slidenerds analytics --plausible yourdomain.com

# Export
slidenerds export --pdf
slidenerds export --pptx
```

## Repository structure

```
slide-nerds/
  packages/
    slide-nerds/           # @strategicnerds/slide-nerds (the npm package)
      src/
        runtime/           # React components (SlideRuntime, SlideShape, etc.)
        cli/               # CLI (slidenerds command)
      templates/           # Scaffold templates (.tmpl files)
      skills/              # 18 SKILL.md files (bundled in package)
  skills/                  # Source skills (development copies)
  apps/
    web/                   # slidenerds.com (Next.js, Supabase, Vercel)
    supabase/              # Database schema, migrations, seed data
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
| `npm test` | Run all tests (131 tests across packages and skills) |
| `npm run build` | Build all packages |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | TypeScript type checking |

### Testing a local build

```bash
cd packages/slide-nerds
npm run build
npm link

# In another directory:
npx slidenerds create test-deck
cd test-deck
npm link @strategicnerds/slide-nerds
npm install
npm run dev
```

## What this is not

Not a slide editor. The LLM is the editor.

Not a slide host. Decks deploy to Vercel (or anywhere Next.js runs).

Not a content generator. The LLM and the user decide what goes in the deck. The skills make sure it looks right.

## License

MIT
