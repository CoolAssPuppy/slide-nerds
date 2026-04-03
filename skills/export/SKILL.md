---
name: export
description: How to export slidenerds decks to PDF, PPTX, and Google Slides
---

# Export skill

How to run exports and what to expect from each format.

## Running exports

```bash
# PDF (best fidelity)
npx slidenerds export --pdf

# PowerPoint
npx slidenerds export --pptx

# Google Slides
npx slidenerds export --gslides

# Custom dev server URL
npx slidenerds export --pdf --url http://localhost:3001
```

Export runs locally. The dev server must be running (`npm run dev`). The CLI loads the page in a headless browser and captures each slide.

## PDF export

PDF produces the highest-fidelity output. What works and what doesn't:

### Works well

- All Tailwind CSS (flexbox, grid, colors, typography, spacing)
- SVG graphics
- Recharts charts (they render as SVG)
- Images (JPEG, PNG, WebP)
- CSS gradients
- Border radius, box shadows
- Custom fonts (if loaded before the snapshot)

### Breaks or degrades

- `backdrop-filter` (blur, brightness) -- not supported in print rendering
- Complex `mix-blend-mode` -- inconsistent across PDF renderers
- CSS `animation` with `infinite` -- creates a moving target; the snapshot captures a random frame
- `position: fixed` elements -- they may repeat on every page or disappear
- Video embeds -- captured as a blank rectangle
- `overflow: scroll` -- the scrollable area is captured at its current scroll position only

### Design for clean PDF export

- Use solid backgrounds instead of backdrop-filter blur
- Avoid infinite animations; use transitions that settle to a final state
- Test with `npx slidenerds export --pdf` early, not just before the deadline

## PowerPoint export

PPTX conversion is more lossy than PDF. Expectations:

### What survives

- Text content and basic formatting (bold, italic, font size)
- Simple layouts (centered, left-aligned)
- Images
- Basic colors

### What doesn't survive

- Complex CSS layouts (grid, flexbox alignment may shift)
- CSS transitions and animations (static snapshot only)
- Custom fonts (PowerPoint substitutes with system fonts unless embedded)
- SVG graphics (rasterized, may lose quality)
- Tailwind utility classes (converted to inline styles, some may be lost)

### Tips for PPTX-friendly slides

- Prefer simple, centered layouts
- Use standard fonts that exist on most systems
- Avoid complex grid arrangements
- Test with PPTX export if the audience needs to edit in PowerPoint

## Google Slides export

The most lossy of the three. Google Slides has the most limited rendering engine.

### Expectations

- Text and basic formatting transfer
- Images transfer
- Complex layouts are flattened or rearranged
- Custom fonts replaced with Google Fonts alternatives
- No animation of any kind
- Tables may lose formatting

### When to use Google Slides export

- When the audience needs to collaborate on the deck in Google Workspace
- When the deck will be edited by non-technical team members
- Accept that the exported deck is a starting point, not a final product

## The runtime export API

The runtime exposes `window.slidenerds.export()` for programmatic export:

```ts
window.slidenerds.export({ format: 'pdf' })
window.slidenerds.export({ format: 'pptx' })
window.slidenerds.export({ format: 'gslides' })
```

The CLI calls this API under the hood via Puppeteer. You don't need to call it directly unless building custom export tooling.

## General export advice

1. **Design for the most restrictive format you need.** If you need Google Slides output, keep layouts simple from the start.
2. **Test exports early.** Don't wait until the day of the presentation to discover that your fancy backdrop-filter doesn't render in PDF.
3. **PDF is almost always good enough.** Most presentation scenarios accept PDF. Only export to PPTX or Google Slides when the audience specifically needs to edit the deck.
4. **Progressive reveals become static.** All `data-step` elements are visible in exported formats. Design slides that still make sense when all content is visible at once.
