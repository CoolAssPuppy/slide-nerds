---
name: slide-types
description: Individual slide type patterns with Tailwind structure and data attributes for slidenerds decks
---

# Slide types skill

Reusable slide patterns. Use these instead of inventing layout from scratch.

## Title slide

The opening slide. Large heading, optional subtitle.

```tsx
<section data-slide="">
  <div
    className="flex flex-col items-center justify-center min-h-screen text-center"
    style={{ padding: 'var(--slide-padding)' }}
  >
    <h1 className="text-6xl font-bold" style={{ color: 'var(--color-text)' }}>
      Presentation title
    </h1>
    <p className="mt-4 text-xl opacity-70">Subtitle or date</p>
    <p className="mt-8 text-lg opacity-50">Author name</p>
  </div>
</section>
```

## Section divider

Separates major sections. Minimal content, strong visual break.

```tsx
<section data-slide="">
  <div
    className="flex items-center justify-center min-h-screen"
    style={{ background: 'var(--color-primary)', padding: 'var(--slide-padding)' }}
  >
    <h2 className="text-5xl font-bold" style={{ color: 'var(--color-accent)' }}>
      Section title
    </h2>
  </div>
</section>
```

## Big stat

Single number with label and context. High visual impact.

```tsx
<section data-slide="">
  <div
    className="flex flex-col items-center justify-center min-h-screen text-center"
    style={{ padding: 'var(--slide-padding)' }}
  >
    <p className="text-8xl font-bold" style={{ color: 'var(--color-accent)' }}>
      $4.2M
    </p>
    <p className="mt-4 text-2xl font-semibold">Annual recurring revenue</p>
    <p className="mt-2 text-lg opacity-60">Up 142% from last year</p>
  </div>
</section>
```

## Pull quote

A quote with attribution. Centered, large text.

```tsx
<section data-slide="">
  <div
    className="flex flex-col items-center justify-center min-h-screen text-center"
    style={{ padding: 'var(--slide-padding)', maxWidth: '800px', margin: '0 auto' }}
  >
    <blockquote className="text-3xl italic leading-relaxed" style={{ color: 'var(--color-text)' }}>
      "The best way to predict the future is to invent it."
    </blockquote>
    <cite className="mt-6 text-lg opacity-60 not-italic">Alan Kay</cite>
  </div>
</section>
```

## Code walkthrough

Syntax highlighted code with optional step-through. Use a `<pre><code>` block with language class for syntax highlighting.

```tsx
<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}>
    <h2 className="text-2xl font-semibold mb-6">Implementation</h2>
    <pre
      className="rounded-lg p-6 text-sm overflow-x-auto"
      style={{ background: 'var(--color-surface)' }}
    >
      <code data-step="" className="block">
        {'const runtime = new SlideRuntime()'}
      </code>
      <code data-step="" className="block mt-2">
        {'runtime.registerSlides(document)'}
      </code>
      <code data-step="" className="block mt-2">
        {'runtime.start()'}
      </code>
    </pre>
  </div>
</section>
```

## Comparison table

Side-by-side comparison of options, features, or approaches.

```tsx
<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}>
    <h2 className="text-3xl font-semibold mb-8">Feature comparison</h2>
    <table className="w-full text-left text-lg">
      <thead>
        <tr className="border-b" style={{ borderColor: 'var(--color-surface)' }}>
          <th className="py-3">Feature</th>
          <th className="py-3">Us</th>
          <th className="py-3">Them</th>
        </tr>
      </thead>
      <tbody>
        <tr data-step="" className="border-b" style={{ borderColor: 'var(--color-surface)' }}>
          <td className="py-3">Speed</td>
          <td className="py-3" style={{ color: 'var(--color-accent)' }}>
            Fast
          </td>
          <td className="py-3 opacity-50">Slow</td>
        </tr>
        <tr data-step="" className="border-b" style={{ borderColor: 'var(--color-surface)' }}>
          <td className="py-3">Price</td>
          <td className="py-3" style={{ color: 'var(--color-accent)' }}>
            $4/mo
          </td>
          <td className="py-3 opacity-50">$20/mo</td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
```

## Team slide

Grid of team members with photos and roles.

```tsx
<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}>
    <h2 className="text-3xl font-semibold mb-8">Our team</h2>
    <div className="grid grid-cols-3 gap-8">
      <div data-step="" className="text-center">
        <div
          className="w-24 h-24 rounded-full mx-auto mb-4"
          style={{ background: 'var(--color-surface)' }}
        />
        <p className="font-semibold">Jane Smith</p>
        <p className="text-sm opacity-60">CEO</p>
      </div>
      {/* More team members */}
    </div>
  </div>
</section>
```

## Timeline

Horizontal or vertical timeline of events.

```tsx
<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}>
    <h2 className="text-3xl font-semibold mb-8">Roadmap</h2>
    <div className="flex justify-between items-start">
      <div data-step="" className="text-center flex-1">
        <div
          className="w-4 h-4 rounded-full mx-auto"
          style={{ background: 'var(--color-accent)' }}
        />
        <p className="mt-2 font-semibold">Q1 2025</p>
        <p className="text-sm opacity-60 mt-1">Launch beta</p>
      </div>
      <div data-step="" className="text-center flex-1">
        <div
          className="w-4 h-4 rounded-full mx-auto"
          style={{ background: 'var(--color-accent)' }}
        />
        <p className="mt-2 font-semibold">Q2 2025</p>
        <p className="text-sm opacity-60 mt-1">GA release</p>
      </div>
      <div data-step="" className="text-center flex-1">
        <div
          className="w-4 h-4 rounded-full mx-auto"
          style={{ background: 'var(--color-accent)' }}
        />
        <p className="mt-2 font-semibold">Q3 2025</p>
        <p className="text-sm opacity-60 mt-1">Enterprise tier</p>
      </div>
    </div>
  </div>
</section>
```

## Full-bleed image with overlay text

```tsx
<section data-slide="">
  <div className="relative min-h-screen">
    <img src="/hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/50" />
    <div
      className="relative z-10 flex items-end min-h-screen"
      style={{ padding: 'var(--slide-padding)' }}
    >
      <div>
        <h2 className="text-4xl font-bold text-white">Image slide title</h2>
        <p className="mt-2 text-xl text-white/70">Caption or context</p>
      </div>
    </div>
  </div>
</section>
```

## Two-up (side by side)

```tsx
<section data-slide="">
  <div
    className="grid grid-cols-2 gap-8 items-center min-h-screen"
    style={{ padding: 'var(--slide-padding)' }}
  >
    <div>
      <h2 className="text-3xl font-semibold">Left side</h2>
      <p className="mt-4 text-lg">Explanation or context</p>
    </div>
    <div className="rounded-lg overflow-hidden">
      <img src="/screenshot.png" alt="Screenshot" className="w-full" />
    </div>
  </div>
</section>
```

## Chart slide (Recharts)

Charts are mandatory in most board decks. Use one core chart per slide and narrate insights in steps.

```tsx
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Q1', value: 400 },
  { name: 'Q2', value: 600 },
  { name: 'Q3', value: 900 },
  { name: 'Q4', value: 1200 },
]

<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}>
    <h2 className="text-3xl font-semibold mb-8">Quarterly revenue</h2>
    <div data-step="" className="step-fade">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="var(--color-text)" />
          <YAxis stroke="var(--color-text)" />
          <Bar dataKey="value" fill="var(--color-accent)" animationDuration={700} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <p data-step="" className="mt-4 text-lg">Revenue acceleration starts in Q3 after sales-led rollout.</p>
  </div>
</section>
```

## Diagram slide (Mermaid)

```tsx
<section data-slide="">
  <div
    className="flex items-center justify-center min-h-screen"
    style={{ padding: 'var(--slide-padding)' }}
  >
    <MermaidDiagram
      chart={`
      graph TD
        A[User request] --> B{Auth check}
        B -->|Valid| C[Process]
        B -->|Invalid| D[Reject]
        C --> E[Response]
    `}
    />
  </div>
</section>
```

See the `animation` skill for the `MermaidDiagram` component implementation.

## Image and logo preparation workflow

Use this pipeline when a deck includes photos, partner logos, or brand marks.

### Preferred asset hierarchy

1. Official SVG from brand guidelines page
2. Official PNG with transparency
3. High-resolution PNG or JPG as fallback

### Background removal

If you only have JPG or opaque PNG:

- Remove background with a segmentation tool.
- Export transparent PNG at 2x expected display size.
- Verify clean edges on dark and light slide backgrounds.

### Monochrome logo treatment

For dark slides, convert logo to white. For light slides, convert to near-black.

```css
.logo-on-dark {
  filter: brightness(0) invert(1);
}

.logo-on-light {
  filter: brightness(0) saturate(0%);
}
```

Use filters only for temporary mockups. For production quality decks, generate true SVG variants.

### JPG to SVG conversion discipline

- Do not auto-trace complex logos and assume brand-safe output.
- Use vectorization only for simple, high-contrast marks.
- Manually inspect path quality before presenting.
- Keep original aspect ratio and clear-space rules.

### Accessibility checks for image slides

- Maintain text contrast ratio at or above 4.5:1 on overlays
- Add meaningful alt text for all non-decorative images
- Avoid text over high-frequency image regions
