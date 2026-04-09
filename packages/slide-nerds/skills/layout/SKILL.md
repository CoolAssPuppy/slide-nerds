---
name: layout
description: Alignment, grid, and arrangement patterns for slidenerds slides using Tailwind CSS
---

# Layout skill

Alignment and arrangement primitives for slide content. Use these patterns instead of guessing at Tailwind classes.

## The default recipe: centered composition

This is the recipe to reach for first. Use `SlideFrame` from `@strategicnerds/slide-nerds` — it encodes the right padding, max-width, header block, and gaps for a vertically and horizontally centered slide:

```tsx
import { SlideFrame } from '@strategicnerds/slide-nerds'

<section data-slide="">
  <SlideFrame
    sectionLabel="The mental model"
    title="AI is a thinking partner."
    subtitle="Four things to internalize before you type anything."
    background="mesh-warm"
  >
    <div className="grid grid-cols-3 gap-6">
      {/* content cards */}
    </div>
  </SlideFrame>
</section>
```

When you need full control, the equivalent raw composition is:

```tsx
<section data-slide="">
  <div
    className="bg-mesh-warm relative flex flex-col items-center justify-center w-full"
    style={{ padding: '5rem 6rem' }}
  >
    <div
      className="flex flex-col items-center w-full"
      style={{ maxWidth: '1400px', gap: '4.5rem' }}
    >
      <div className="flex flex-col items-center text-center" style={{ gap: '1.5rem' }}>
        <p className="section-label">Section</p>
        <h2 className="text-[3.25rem] font-bold">Slide title.</h2>
        <p className="text-xl" style={{ color: 'var(--color-text-secondary)', maxWidth: '66ch' }}>
          Subtitle at reading length.
        </p>
      </div>
      <div className="grid grid-cols-3 w-full" style={{ gap: '1.75rem' }}>
        {/* content */}
      </div>
    </div>
  </div>
</section>
```

Reach for top-left anchored layouts only when the content is genuinely dense (tables with many rows, multi-column comparisons, dashboards with six or more tiles). See the "opt-in" patterns later in this file.

## Alignment

### Center content (horizontal and vertical)

The one-off primitive if you don't want `SlideFrame`:

```tsx
<section data-slide="">
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-5xl font-bold">Centered title</h1>
    </div>
  </div>
</section>
```

### Left-align a group of elements

```tsx
<div className="flex flex-col items-start gap-4" style={{ padding: 'var(--slide-padding)' }}>
  <h2 className="text-3xl font-semibold">Left-aligned heading</h2>
  <p className="text-lg">Body text aligned to the left edge</p>
  <img src="/chart.png" alt="Chart" className="w-full max-w-md" />
</div>
```

### Right-align a group of elements

```tsx
<div className="flex flex-col items-end gap-4" style={{ padding: 'var(--slide-padding)' }}>
  <p className="text-lg">Right-aligned caption</p>
  <p className="text-sm opacity-70">Source: Company data</p>
</div>
```

### Bottom-align content

```tsx
<section data-slide="">
  <div className="flex flex-col justify-end min-h-screen" style={{ padding: 'var(--slide-padding)' }}>
    <h2 className="text-3xl font-semibold">Pinned to bottom</h2>
  </div>
</section>
```

## Grid arrangements

### Two-column layout

```tsx
<section data-slide="">
  <div className="grid grid-cols-2 gap-8 min-h-screen items-center" style={{ padding: 'var(--slide-padding)' }}>
    <div>
      <h2 className="text-3xl font-semibold">Left column</h2>
      <p className="mt-4 text-lg">Explanation text</p>
    </div>
    <div>
      <img src="/visual.png" alt="Visual" className="w-full rounded-lg" />
    </div>
  </div>
</section>
```

### Three-column layout

```tsx
<div className="grid grid-cols-3 gap-6" style={{ padding: 'var(--slide-padding)' }}>
  <div className="text-center">
    <p className="text-4xl font-bold">$4.2M</p>
    <p className="text-sm opacity-70 mt-2">ARR</p>
  </div>
  <div className="text-center">
    <p className="text-4xl font-bold">142%</p>
    <p className="text-sm opacity-70 mt-2">Growth</p>
  </div>
  <div className="text-center">
    <p className="text-4xl font-bold">98%</p>
    <p className="text-sm opacity-70 mt-2">Retention</p>
  </div>
</div>
```

### Four-column layout

```tsx
<div className="grid grid-cols-4 gap-4" style={{ padding: 'var(--slide-padding)' }}>
  {/* Four equal columns */}
</div>
```

## Distribute elements evenly

### Horizontal distribution

```tsx
<div className="flex justify-between items-center" style={{ padding: 'var(--slide-padding)' }}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Vertical distribution

```tsx
<div className="flex flex-col justify-between min-h-screen" style={{ padding: 'var(--slide-padding)' }}>
  <div>Top</div>
  <div>Middle</div>
  <div>Bottom</div>
</div>
```

## Hero + body layout

Large heading at top, body content below:

```tsx
<section data-slide="">
  <div className="flex flex-col min-h-screen" style={{ padding: 'var(--slide-padding)' }}>
    <h1 className="text-6xl font-bold">Hero headline</h1>
    <div className="mt-auto">
      <p className="text-xl">Supporting body content goes here</p>
    </div>
  </div>
</section>
```

## Full-bleed vs. contained

### Full-bleed (edge to edge)

```tsx
<section data-slide="">
  <div className="relative min-h-screen">
    <img src="/bg.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
    <div className="relative z-10 flex items-center justify-center min-h-screen">
      <h1 className="text-5xl font-bold text-white">Full-bleed image</h1>
    </div>
  </div>
</section>
```

### Contained (with slide padding)

```tsx
<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}>
    <h2 className="text-3xl font-semibold">Contained content</h2>
  </div>
</section>
```

## Spacing tokens

Always use the spacing tokens from `brand.config.ts` via CSS custom properties:

- `var(--slide-padding)` for the outer slide padding (default: 4rem)
- Tailwind gap utilities (`gap-4`, `gap-8`) for element spacing within a slide
- Never hardcode pixel or rem values for slide-level spacing

## Aspect ratio preservation

For media elements that need to maintain aspect ratio:

```tsx
<div className="aspect-video w-full">
  <img src="/screenshot.png" alt="Screenshot" className="w-full h-full object-contain" />
</div>
```

Common aspect ratios: `aspect-video` (16:9), `aspect-square` (1:1), `aspect-[4/3]` (4:3).
