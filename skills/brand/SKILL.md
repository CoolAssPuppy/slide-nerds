---
name: brand
description: How to read and apply brand.config.ts when generating slidenerds slide layouts
---

# Brand skill

How to read `brand.config.ts` and apply it before generating any layout.

## The rule

Read `brand.config.ts` before writing any slide code. Never hardcode color values, font names, or spacing values. Always use the tokens from the brand config.

## Brand config shape

```ts
import type { BrandConfig } from '@slidenerds/runtime'

export default {
  colors: {
    primary: '#1a1a2e',
    accent: '#e94560',
    background: '#0f3460',
    surface: '#16213e',
    text: '#eaeaea',
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  spacing: {
    slide: '4rem',
    section: '2rem',
    element: '1rem',
  },
  tailwind: {
    extend: {
      colors: { brand: '#e94560' },
    },
  },
} satisfies BrandConfig
```

## Color tokens

Colors are exposed as CSS custom properties in `globals.css`:

| Token | CSS variable | Usage |
|-------|-------------|-------|
| `primary` | `var(--color-primary)` | Primary brand color, section backgrounds |
| `accent` | `var(--color-accent)` | Highlights, CTAs, emphasis |
| `background` | `var(--color-background)` | Page/slide background |
| `surface` | `var(--color-surface)` | Cards, code blocks, elevated surfaces |
| `text` | `var(--color-text)` | Default text color |

### How to use

```tsx
{/* Correct: use CSS custom properties */}
<h1 style={{ color: 'var(--color-text)' }}>Title</h1>
<div style={{ background: 'var(--color-surface)' }}>Card</div>
<span style={{ color: 'var(--color-accent)' }}>Highlighted</span>

{/* Wrong: hardcoded hex values */}
<h1 style={{ color: '#eaeaea' }}>Title</h1>
```

For Tailwind classes, use the extended colors from the brand config:

```tsx
<span className="text-brand">Accent text</span>
```

## Typography

| Token | Font | Usage |
|-------|------|-------|
| `heading` | From brand config | All headings (h1-h6) |
| `body` | From brand config | Body text, lists, paragraphs |
| `mono` | From brand config | Code blocks, inline code |

Apply fonts via CSS or Tailwind:

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading), system-ui, sans-serif;
}

body {
  font-family: var(--font-body), system-ui, sans-serif;
}

code, pre {
  font-family: var(--font-mono), monospace;
}
```

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `slide` | Usually `4rem` | Outer padding of each slide |
| `section` | Usually `2rem` | Space between major sections within a slide |
| `element` | Usually `1rem` | Space between elements (paragraphs, list items) |

Apply spacing via CSS custom properties:

```tsx
<div style={{ padding: 'var(--slide-padding)' }}>
  <h2>Section heading</h2>
  <div style={{ marginTop: 'var(--section-spacing)' }}>
    <p>Content with section spacing above</p>
  </div>
</div>
```

## Tailwind extension

The `tailwind.extend` section of the brand config should be merged into `tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss'
import brandConfig from './brand.config'

export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: brandConfig.tailwind?.extend,
  },
} satisfies Config
```

## When a design element has no brand token

If you need a color, font, or spacing value that isn't in the brand config: ask the user. Do not guess or introduce new values without confirmation. The brand config is the source of truth for visual consistency across the deck.

## Common mistakes

- Using `#e94560` instead of `var(--color-accent)` -- always use the variable
- Using `px` values for slide padding instead of the spacing token
- Using a font that isn't in the brand config without asking
- Adding new color values directly in Tailwind classes instead of extending through the brand config
