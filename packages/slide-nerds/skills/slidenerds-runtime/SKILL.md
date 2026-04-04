---
name: slidenerds-runtime
description: Core runtime conventions for building slidenerds presentation decks in Next.js
---

# Slidenerds runtime conventions

This skill covers the foundational data conventions, file structure, and runtime behavior that every other slidenerds skill depends on. Install this skill first.

## Data attributes

The runtime recognizes three HTML attributes on any element:

### `data-slide`

Marks an element as a slide. The runtime tracks all `[data-slide]` elements in DOM order for navigation, the light table, and the slide counter.

```tsx
<section data-slide="">
  <h1>My slide title</h1>
</section>
```

Each `data-slide` element should represent one full-viewport slide. Use `<section>` as the wrapper element by convention.

### `data-step`

Marks an element for progressive reveal. Elements with `data-step` start hidden (`visibility: hidden; opacity: 0`) and become visible one at a time on each advance action (click, space, right arrow).

```tsx
<section data-slide="">
  <h2>Three reasons</h2>
  <p data-step="">First reason</p>
  <p data-step="">Second reason</p>
  <p data-step="">Third reason</p>
</section>
```

Steps are revealed in DOM order within their parent slide. When all steps on a slide are revealed, the next advance action moves to the next slide.

### `data-notes`

Speaker notes. These elements are hidden during presentation mode and rendered in the presenter window (opened with `P`).

```tsx
<section data-slide="">
  <h2>Revenue growth</h2>
  <p>$4.2M ARR</p>
  <div data-notes="">
    Mention the Q3 acceleration. Pause for questions after the number.
  </div>
</section>
```

Place `data-notes` elements inside their parent slide. You can have multiple `data-notes` elements per slide.

## File structure

A slidenerds deck is a standard Next.js App Router project:

```
my-deck/
  app/
    layout.tsx       # Root layout with <SlideRuntime> wrapper
    page.tsx         # Main slide deck
    globals.css      # Global styles with CSS custom properties
  brand.config.ts    # Brand colors, fonts, spacing
  CLAUDE.md          # LLM instructions for this deck
  package.json
  tsconfig.json
```

### Root layout

The root layout wraps everything in `<SlideRuntime>`:

```tsx
import { SlideRuntime } from '@slidenerds/runtime'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SlideRuntime>{children}</SlideRuntime>
      </body>
    </html>
  )
}
```

### Slide structure

Slides live in `app/page.tsx` (or split across route segments). Each slide is a `<section data-slide="">` element:

```tsx
export default function Home() {
  return (
    <main>
      <section data-slide="">
        {/* Slide 1 content */}
      </section>
      <section data-slide="">
        {/* Slide 2 content */}
      </section>
    </main>
  )
}
```

## Keyboard controls

| Key | Action |
|-----|--------|
| Space / Right arrow | Advance (next step or next slide) |
| Left arrow / Backspace | Go back (previous step or previous slide) |
| Double-click | Previous slide |
| P | Open presenter mode |
| L | Open light table |
| F | Toggle fullscreen |
| Escape | Exit fullscreen |

## URL sync

The current slide is reflected in the URL as `?slide=N` (1-indexed). Sharing a URL with `?slide=5` opens directly to slide 5. Browser back/forward navigates between slides.

## Brand config

Every deck ships with `brand.config.ts`. Read this file before generating any layout or color. See the `brand` skill for full details.

```ts
import type { BrandConfig } from '@slidenerds/runtime'

export default {
  colors: { primary: '#1a1a2e', accent: '#e94560', background: '#0f3460', surface: '#16213e', text: '#eaeaea' },
  fonts: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
  spacing: { slide: '4rem', section: '2rem', element: '1rem' },
} satisfies BrandConfig
```

## CSS conventions

Global styles define CSS custom properties from the brand config:

```css
[data-slide] {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

[data-notes] {
  display: none;
}

[data-step] {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
```

The runtime manages `data-step` visibility programmatically. The CSS provides the initial hidden state and transition.
