---
name: visual-design
description: Layout, spacing, typography scale, and compositional rules for polished slidenerds slides
---

# Visual design skill

Use this skill whenever building or reviewing slide content. These rules govern layout, spacing, composition, and visual hierarchy. They are independent of color palette and font choice -- users bring their own brand tokens. This skill governs how those tokens are applied spatially.

## Canvas and safe zones

The canvas is 16:9 (1920x1080 logical pixels). All content must respect two boundaries:

- **Action safe**: 3.5% inset from each edge. No content outside this boundary.
- **Title safe**: 5% inset from each edge. All readable text must stay inside this boundary.

For slidenerds, `--slide-padding` controls the outer margin. Set it to 5-8% of the smaller dimension. On a 1080-tall canvas, that is 54-86px, which maps to `3.5rem` to `5.5rem`. The default is `5rem`.

```
+-------------------------------------------+
|  3.5% action safe                         |
|  +-------------------------------------+  |
|  |  5% title safe                      |  |
|  |                                     |  |
|  |    Content lives here               |  |
|  |                                     |  |
|  +-------------------------------------+  |
+-------------------------------------------+
```

## The default layout is top-left anchored

This is the most important layout rule. The majority of slides in any professional deck anchor content to the top-left corner, with the title at a fixed position and content flowing downward. The bottom portion of the slide is breathing room.

**Do NOT vertically center content on most slides.** Vertically centered content is only appropriate for these specific slide types:

- **Big stat**: A single number that dominates the slide
- **Section divider**: A section name between major parts of the deck
- **Quote**: A blockquote with attribution
- **Closing**: Contact info or "Questions?"

Every other slide type -- charts, tables, text, timelines, dashboards, diagrams, team slides, process flows, comparisons, icon grids -- uses top-left anchored layout. The title starts near the top of the slide at a consistent Y position across all content slides. This consistency is what makes a deck feel like a designed system rather than a collection of individual slides.

```
WRONG (everything centered -- looks like a default template):
+-------------------------------------------+
|                                           |
|                                           |
|           Title                           |
|           Content here                    |
|                                           |
|                                           |
+-------------------------------------------+

RIGHT for text/bullets/tables (anchored below title):
+-------------------------------------------+
|  SECTION LABEL                            |
|  Title                                    |
|                                           |
|  - Bullet point one                       |
|  - Bullet point two                       |
|  - Bullet point three                     |
|                                           |
|                    [breathing room]       |
+-------------------------------------------+

RIGHT for diagrams/charts/shapes (title top-left, visual centered):
+-------------------------------------------+
|  SECTION LABEL                            |
|  Title                                    |
|                                           |
|         [diagram or chart centered        |
|          in the remaining space]          |
|                                           |
+-------------------------------------------+
```

There are two sub-patterns for top-left anchored slides:

1. **Text content** (bullets, numbered lists, tables, KPI grids): Content flows directly below the title, anchored to the left. The bottom is breathing room.
2. **Visual content** (diagrams, charts, shapes, process flows, icon grids, team avatars): Title stays top-left. The visual centers both horizontally and vertically in the remaining space below the title. Use `flex-1 flex items-center justify-center` on the visual container.

## The one-thing rule

Each slide communicates exactly one idea. One stat. One chart. One comparison. One quote. The moment a slide tries to say two things, it stops feeling designed and starts feeling assembled.

Ask: "What is the single sentence this slide says?" If you need two sentences, make two slides.

## Content density limits

| Deck style | Max words per slide | Max content chunks | Whitespace ratio |
|---|---|---|---|
| Keynote (Apple, Stripe) | 10-30 | 2 | 60-70% |
| Board / pitch (Sequoia) | 30-50 | 3-4 | 45-55% |
| Training / educational | 40-75 | 4 | 35-45% |

A "content chunk" is a visually distinct group: a text block, a chart, a stat with its label, an image with caption.

Never exceed 3 distinct type sizes on one slide: title, body, and detail. A fourth size signals too much content.

## Typography scale

Use a modular scale ratio to define type sizes. The two ratios that work for presentations:

- **Perfect fourth (1.333)**: body 24 > 32 > 42 > 56. Good for content-heavy slides.
- **Perfect fifth (1.5)**: body 24 > 36 > 54 > 80. Good for keynote moments.

Pick one ratio per deck and use it everywhere.

### Size floors for projection

| Role | Minimum | Recommended |
|---|---|---|
| Title / hero | 36pt | 56-80pt |
| Heading (H2) | 28pt | 36-48pt |
| Body text | 20pt | 24-32pt |
| Caption / label | 16pt | 18-20pt |

Never set text smaller than 16pt. At projection distance, anything below that disappears.

### Line height

- Titles: `leading-none` to `leading-tight` (1.0-1.15). Tight title spacing is a core differentiator between polished and amateur decks.
- Body: `leading-relaxed` (1.35-1.5). Open enough for distance reading.
- Labels and captions: `leading-snug` (1.2-1.3).

### Letter spacing

Tight negative tracking on headings creates a confident, editorial feel:

- Titles: `tracking-tight` (-0.02em)
- Body: `tracking-normal` (0)
- Uppercase labels: `tracking-widest` (0.1-0.2em)

## Grid system

Use a 12-column conceptual grid for horizontal layout. Twelve divides into halves (6+6), thirds (4+4+4), quarters (3+3+3+3), and asymmetric splits.

### Column allocations by slide type

| Slide type | Layout | Tailwind |
|---|---|---|
| Title, big stat, quote | Content centered or left in 8-10 cols | `max-w-4xl mx-auto` or left-aligned |
| Two-up (text + image) | 5 cols text, 7 cols image (asymmetric) | `grid grid-cols-12`, `col-span-5` / `col-span-7` |
| Three stats | 4 cols each | `grid grid-cols-3 gap-16` |
| Chart + annotation | Full width chart, annotation below | Single column, stacked |
| Table | 10 cols centered | `max-w-4xl mx-auto` |

Asymmetric splits (5:7, 4:8) look more designed than symmetric ones (6:6). Use them by default for two-element layouts.

## Spacing system

### The hierarchy rule

Internal spacing (within a group) must always be smaller than external spacing (between groups). The ratio is 1:2.

```
Title
  [0.5x heading height gap]
Body text paragraph
  [1x body line height gap]
Body text paragraph

  [2-3x body line height gap]    <-- section break

Next group title
```

### Specific spacing values

| Relationship | Spacing | Tailwind |
|---|---|---|
| Heading to body | 0.5-1x heading line height | `mt-3` to `mt-6` |
| Between body paragraphs | 0.75-1x body line height | `mt-4` |
| Between content chunks | 2-3x body line height | `mt-10` to `mt-16` |
| Between section label and heading | `mt-3` | Small, tight coupling |
| Chart/image to its caption | `mt-4` to `mt-6` | Visually grouped |
| Stat number to its label | `mt-2` to `mt-3` | Tight, single unit |

### The double-spacing heuristic

Whatever spacing looks right at your desk, double it. Slides are viewed from distance. Spacing that feels generous while editing feels normal on a projector. Spacing that feels normal while editing feels cramped projected.

## Visual hierarchy through opacity

Opacity is more effective than color changes for creating hierarchy on slides. It works with any palette.

| Level | Opacity | Use |
|---|---|---|
| Primary | 100% | Title, hero stat, key data |
| Secondary | 60-70% | Body text, labels |
| Tertiary | 40-50% | Captions, attribution, metadata |
| Decorative | 10-25% | Background elements, dividers |

Apply with Tailwind: `opacity-100`, `opacity-60`, `opacity-40`.

For text on dark backgrounds, consider `99%` opacity on primary text (not 100%). This is subtle but softens the rendering and reduces harshness.

## Compositional patterns

### Rule of thirds

Divide the slide into a 3x3 grid. Place focal elements at the four intersection points. In a 1920x1080 frame, the power points are at approximately (640, 360), (1280, 360), (640, 720), (1280, 720).

Do not center every slide. Reserve centered composition for hero moments (big stat, title, closing). Use rule-of-thirds positioning for content slides.

### Asymmetry over symmetry

Perfectly centered, symmetric layouts read as "default template." Use asymmetry to create visual tension:

- Left-aligned text on a centered slide
- Content weighted to one side with whitespace on the other
- Uneven column splits (5:7, 4:8)

### Consistent anchor points across slides

The single biggest signal of a "designed" deck vs. an "assembled" one: recurring elements occupy the same position on every slide.

- Section labels: same x and y on every slide that has one
- Titles: same y-position (baseline alignment) across all content slides
- Body text: same x-position (left edge) across all content slides
- Logo / page indicator: same corner, same size, every slide

Define these positions once and reuse them. In slidenerds, this means extracting consistent padding and positioning values.

### The left-content, right-atmosphere pattern

Used in Apple keynotes and the Supabase re:Invent deck: content occupies the left 50-55% of the slide. The right side is reserved for atmospheric imagery, gradient wash, or intentional emptiness. This creates a strong reading anchor on the left and visual breathing room on the right.

## Section structure

### Section labels

Every content slide (except title and closing) should have a section label -- a small uppercase text above the title that tells the audience where they are in the deck.

```tsx
<p className="text-sm font-semibold tracking-[0.2em] uppercase mb-3"
  style={{ color: 'var(--color-accent)' }}>
  Revenue
</p>
<h2 className="text-4xl font-bold tracking-tight">
  ARR trajectory
</h2>
```

The label uses the accent color, uppercase, wide tracking. The title uses the primary text color, tight tracking. The contrast between the two (small+wide vs. large+tight) creates clear hierarchy.

### Section dividers

Between major sections, insert a divider slide. It contains only a section number and title, centered. Use the primary/surface background color, not the standard slide background, to create a visual break.

## Slide type spacing recipes

### Title slide

```
Bottom-aligned layout:
  accent-line (48x3px)          at bottom 35%
  title (56-72pt, tight)        mt-8 below line
  subtitle (20-24pt, 50% opacity)  mt-5
  metadata row (12-14pt, 40% opacity, uppercase tracking)  mt-16
```

Content gravity is bottom-left. The top 50-60% of the slide is breathing room.

### Big stat slide

```
Center-aligned layout:
  stat number (80-160pt, accent color, glow)    centered
  label (24-32pt, 60% opacity)                  mt-2 to mt-4
  context badge (pill shape, accent-dim bg)      mt-8 to mt-10
```

The stat is optically centered (slightly above true center). The label sits close to the number (they are a single unit). The context badge has more separation.

### Chart slide

```
Left-aligned layout:
  section label + title          top section
  chart in card surface          mt-8 to mt-12, full width up to max-w-4xl
  annotation with bullet dot     mt-5 to mt-6 below chart
```

Charts sit inside a card surface (subtle border, slightly elevated background) to separate them from the slide background. One chart per slide. The annotation is a single sentence with a small accent-colored dot before it.

Charts must use the full available width of the slide -- never constrain them to a narrow `max-width`. Use `flex-1` with `minHeight: 0` so the chart grows to fill available vertical space within the slide padding. The `ResponsiveContainer` should use `height="100%"` not a fixed pixel height.

### Comparison table

```
Left-aligned layout:
  section label + title          top section
  table in card surface          mt-8, full width up to max-w-4xl
    header row: uppercase, small, muted, elevated bg
    data rows: revealed one at a time via data-step
```

Table headers use the same style as section labels (small, uppercase, wide tracking, muted color). Data cells use body text size. Accent color highlights the "winning" values.

### Quote slide

```
Center-aligned layout:
  large open-quote glyph (accent color, 30% opacity)   decorative
  quote text (28-36pt, light weight, relaxed leading)    mt-6 to mt-8
  avatar circle + name + role (left-aligned pair)        mt-10 to mt-12
```

Constrain the quote to `max-w-3xl` for comfortable line length. The open-quote glyph is decorative, not structural.

### Timeline / roadmap

```
Left-aligned layout:
  section label + title          top section, mb-12 to mb-16
  horizontal connector line      thin, muted, full width
  timeline nodes                 grid cols, each with:
    dot (accent, with glow)
    quarter label (bold, mt-4)
    milestone name (medium, mt-1)
    detail (small, muted, mt-1)
```

Completed milestones use full accent color. Future milestones use dimmed dot (muted background, no glow).

## Background treatments

### Gradient mesh

Subtle radial gradients in the background create depth without competing with content. Use the accent color at 4-8% opacity in two overlapping ellipses at different positions.

```css
background:
  radial-gradient(ellipse at 20% 50%, rgba(accent, 0.08) 0%, transparent 50%),
  radial-gradient(ellipse at 80% 20%, rgba(accent, 0.04) 0%, transparent 40%),
  var(--color-background);
```

Alternate between warm and cool mesh positions across slides for visual variety.

### Film grain

A subtle noise texture at 2-3% opacity adds tactile quality to dark backgrounds. Apply as a pseudo-element on `[data-slide]` so it covers every slide automatically.

### Section divider backgrounds

Use a linear gradient from primary to surface color. This is the visual cue that says "this is a structural break, not a content slide."

## Card surfaces

Charts, tables, and code blocks sit inside card surfaces rather than directly on the slide background. A card surface is:

- Background: `var(--color-surface)` (one step lighter than slide background)
- Border: 1px solid at 6% white opacity
- Border radius: 12px
- Padding: 1.5-2rem

Cards create depth and separation. They are the visual equivalent of a frame around a painting.

## What to avoid

- Centering everything. Most slides are top-left anchored. Only big stat, section divider, quote, and closing use centered layout. If you are unsure, use top-left.
- More than one chart per slide.
- Text below 16pt.
- More than 3 type sizes on one slide.
- Symmetric column splits when asymmetric would work.
- Content that fills the entire slide with no whitespace.
- Background images behind text without a contrast overlay.
- Decorative elements that do not support the content hierarchy.
- Inconsistent positioning of recurring elements across slides.
