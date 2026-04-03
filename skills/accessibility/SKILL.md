---
name: accessibility
description: WCAG compliance, contrast ratios, motion reduction, screen reader support, and projection readability for slidenerds slides
---

# Accessibility skill

Use this skill when building or reviewing slides to ensure they are accessible to all audiences, including people with visual, motor, or cognitive disabilities, and audiences viewing on projectors in bright rooms.

## Color contrast

### WCAG 2.2 AA requirements

| Element | Minimum contrast ratio | Notes |
|---|---|---|
| Normal text (<24px) | 4.5:1 against background | All body text, labels, captions |
| Large text (>=24px or >=18.66px bold) | 3:1 against background | Titles, headings, hero stats |
| UI components and graphics | 3:1 against adjacent colors | Chart bars, shape borders, icons, buttons |
| Focus indicators | 3:1 against adjacent colors | Keyboard navigation outlines |

### Projection adjustment

Projectors reduce contrast. Aim higher than WCAG minimums:

| Element | Target for projection |
|---|---|
| Body text | 7:1 or higher |
| Headings | 4.5:1 or higher |
| Chart elements | 4:1 or higher |

### How to check contrast

Use the accent and text colors from `brand.config.ts` and verify against the background:

```
Text (#e8e6e3) on Background (#111114) = 14.7:1  (passes)
Accent (#f59e0b) on Background (#111114) = 8.3:1  (passes)
Text-secondary (60% opacity) on Background = ~7.5:1  (passes)
Text-tertiary (40% opacity) on Background = ~4.2:1  (passes for large text only)
```

When creating a new brand palette, verify these four combinations before building slides.

### Color-blind safe palettes

8% of men and 0.5% of women have some form of color vision deficiency. When using color to encode meaning (charts, status indicators, before/after):

- Never rely on color alone. Add text labels, patterns, or shapes.
- Avoid red/green as the only differentiator. Use red/blue or orange/blue instead.
- For chart series, use shapes (circle, square, triangle) alongside colors.
- Test with a color blindness simulator (Chrome DevTools > Rendering > Emulate vision deficiencies).

Safe color pairs for data visualization:

| Pair | Works for |
|---|---|
| Blue (#3b82f6) + Orange (#f59e0b) | All color vision types |
| Blue (#3b82f6) + Red (#ef4444) | Protanopia, tritanopia |
| Purple (#8b5cf6) + Yellow (#eab308) | All types |
| Teal (#14b8a6) + Pink (#ec4899) | Deuteranopia, protanopia |

## Typography accessibility

### Minimum font sizes

These are absolute minimums, not recommendations. See the visual-design skill for recommended sizes.

| Element | Minimum on screen | Minimum for projection |
|---|---|---|
| Body text | 16px (1rem) | 20px (1.25rem) |
| Captions / labels | 14px (0.875rem) | 16px (1rem) |
| Footnotes | 12px (0.75rem) | Never use on projected slides |

### Line length

- Maximum 75 characters per line for body text.
- Use `max-w-3xl` (48rem) to constrain text blocks.
- Narrower is better for readability from distance.

### Font weight

- Body text: 400 (regular) minimum. Never use 300 (light) for body text below 24px.
- Headings: 600-800. The weight contrast between heading and body aids scannability.

## Motion and animation

### prefers-reduced-motion

Some users experience vertigo, nausea, or seizures from animation. Respect the OS-level motion preference:

```css
@media (prefers-reduced-motion: reduce) {
  [data-step] {
    transition: none !important;
    animation: none !important;
  }

  [data-step].step-visible {
    visibility: visible !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

Add this to `globals.css` in every deck. It disables all step animations while preserving content visibility.

### Animation safety rules

- No animation faster than 100ms (appears as a flash).
- No animation slower than 800ms for presenter-controlled steps (breaks pacing).
- No infinite loops on visible content.
- No more than 3 elements animating simultaneously.
- No flashing content (3 flashes per second is the WCAG seizure threshold).

## Screen reader support

### Slide structure

- Each slide is a `<section>` with `data-slide`. Add `role="region"` and `aria-label` for screen reader navigation:

```tsx
<section data-slide="" role="region" aria-label="Quarterly revenue">
```

- Use semantic heading hierarchy: one `<h1>` for the deck title (on the title slide), `<h2>` for slide titles, `<h3>` for sub-sections.

### Speaker notes as descriptions

Speaker notes contain the verbal explanation of each slide. Make them available to screen readers:

```tsx
<section data-slide="" role="region" aria-label="Revenue chart"
  aria-describedby={`notes-${slideIndex}`}>
  {/* Slide content */}
  <div data-notes="" id={`notes-${slideIndex}`}>
    Revenue grew 142% year over year, driven by enterprise contracts in Q3 and Q4.
  </div>
</section>
```

The `data-notes` elements are visually hidden but remain in the DOM for screen readers.

### Images

Every `<img>` must have an `alt` attribute:

- **Decorative images** (backgrounds, textures): `alt=""`
- **Content images** (screenshots, photos of people): Descriptive alt text
- **Charts rendered as images**: Alt text should describe the key insight, not the raw data. "Bar chart showing revenue growing from $1.1M to $4.2M over five quarters" not "Bar chart with five bars."

### Charts

Recharts renders SVG which is not screen-reader friendly. Add a visually hidden data table as an alternative:

```tsx
<div data-step="" className="step-fade">
  <div className="card-surface p-8">
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>{/* ... */}</BarChart>
    </ResponsiveContainer>
  </div>
  {/* Screen reader alternative */}
  <table className="sr-only">
    <caption>Quarterly ARR in millions</caption>
    <thead><tr><th>Quarter</th><th>ARR</th></tr></thead>
    <tbody>
      {data.map((d) => (
        <tr key={d.quarter}><td>{d.quarter}</td><td>${d.arr}M</td></tr>
      ))}
    </tbody>
  </table>
</div>
```

Add this utility class to `globals.css`:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## Keyboard navigation

The runtime already handles keyboard navigation (arrow keys, space, P, L, F, Escape). Additional accessibility requirements:

- All interactive elements (Light Table cards, controls menu) must be focusable with Tab.
- Focus must be visible (minimum 2px outline in accent color).
- Focus order must follow visual order (left-to-right, top-to-bottom).

```css
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

## Language declaration

Set the `lang` attribute on `<html>`. This enables screen readers to use correct pronunciation:

```tsx
<html lang="en">
```

For multilingual decks, use `lang` on individual elements:

```tsx
<p lang="fr">Bonjour le monde</p>
```

## Checklist

Before presenting, verify:

- [ ] All text meets contrast requirements (4.5:1 normal, 3:1 large)
- [ ] Accent color meets 3:1 against background
- [ ] No text below 16px on screen (20px for projection)
- [ ] `prefers-reduced-motion` media query added to `globals.css`
- [ ] All `<img>` tags have `alt` attributes
- [ ] Slide `<section>` elements have `aria-label`
- [ ] Charts have hidden data table alternatives
- [ ] Focus styles are visible on all interactive elements
- [ ] `lang` attribute set on `<html>`
- [ ] No content relies solely on color to convey meaning
- [ ] No flashing content (3+ flashes per second)
- [ ] Heading hierarchy is sequential (h1 > h2 > h3)
