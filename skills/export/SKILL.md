---
name: export
description: How to export slidenerds decks to PDF
---

# Export skill

How to run exports and what to expect.

## Running exports

```bash
npx slidenerds export --pdf

# Custom dev server URL
npx slidenerds export --pdf --url http://localhost:3001
```

Export runs locally. The dev server must be running (`npm run dev`). The CLI loads the page in a headless browser and captures each slide.

## PDF export

PDF produces high-fidelity output. What works and what doesn't:

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

## The runtime export API

The runtime exposes `window.slidenerds.export()` for programmatic export:

```ts
window.slidenerds.export({ format: 'pdf' })
```

The CLI calls this API under the hood via Puppeteer. You don't need to call it directly unless building custom export tooling.

## General export advice

1. **Test exports early.** Don't wait until the day of the presentation to discover that your fancy backdrop-filter doesn't render in PDF.
2. **PDF is almost always good enough.** Most presentation scenarios accept PDF.
3. **Progressive reveals become static.** All `data-step` elements are visible in exported formats. Design slides that still make sense when all content is visible at once.
