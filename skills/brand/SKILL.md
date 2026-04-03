---
name: brand
description: How to apply brand identity to a slidenerds deck by editing brand.config.ts and globals.css
---

# Brand skill

Use this skill when creating a new deck, rebranding an existing deck, or applying a company's visual identity. This skill tells you exactly which files to edit and what values to set.

## The branding system

Every slidenerds deck has two files that control brand:

1. **`brand.config.ts`** at the project root. This is the single source of truth for colors, fonts, and spacing. The layout template reads this file and injects CSS custom properties on the `<html>` element at build time.
2. **`app/globals.css`** for structural CSS, font imports, and derived color tokens. Add custom `@import` rules for web fonts here. Do not hardcode colors in slide content. Always use `var()` references.

Changing `brand.config.ts` rebrands the entire deck. No slide files need color or font edits.

## brand.config.ts structure

```typescript
import type { BrandConfig } from '@slidenerds/runtime'

export default {
  colors: {
    primary: '#0d0d0f',
    accent: '#f59e0b',
    background: '#111114',
    surface: '#1a1a1f',
    text: '#e8e6e3',
  },
  fonts: {
    heading: 'Sora, system-ui, sans-serif',
    body: 'DM Sans, system-ui, sans-serif',
    mono: 'JetBrains Mono, ui-monospace, monospace',
  },
  spacing: {
    slide: '5rem',
    section: '2rem',
    element: '1rem',
  },
} satisfies BrandConfig
```

## How layout.tsx wires brand to CSS

The generated `app/layout.tsx` imports `brand.config.ts` and injects CSS custom properties:

```tsx
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

This means every CSS `var()` reference resolves to the brand.config.ts values. No manual wiring needed.

## What each color controls

| Token | CSS variable | Used by |
|---|---|---|
| `primary` | `--color-primary` | Section divider backgrounds, darkest surfaces |
| `accent` | `--color-accent` | Section labels, stat numbers, shape strokes, active indicators, chart fills, timeline dots, table highlights |
| `background` | `--color-background` | Slide canvas, body background |
| `surface` | `--color-surface` | Card backgrounds for charts, tables, code blocks |
| `text` | `--color-text` | Primary body text, headings |

## Derived colors

Some slides need colors derived from the base palette. Define these in `globals.css`:

```css
:root {
  --color-accent-dim: rgba(245, 158, 11, 0.12);
  --color-text-secondary: rgba(232, 230, 227, 0.6);
  --color-text-tertiary: rgba(232, 230, 227, 0.4);
  --color-border: rgba(255, 255, 255, 0.06);
  --color-surface-elevated: #222228;
}
```

When rebranding, extract the RGB values from the new accent and text colors and recompute these at the correct opacities.

## How to rebrand step by step

### Given a brand kit (colors + fonts)

1. **Edit `brand.config.ts`**: Set the five core colors and three font stacks.
2. **Update derived colors in `globals.css`**: Recompute accent-dim, text-secondary, text-tertiary, border, and surface-elevated using the new base values.
3. **Add font imports in `globals.css`**: Add Google Fonts `@import` rules before the Tailwind import.
4. **Done.** No slide files need editing.

### Given only a logo or single brand color

Derive the full palette from one color:

- **accent**: The brand color itself.
- **background**: Near-black with a subtle hue tint toward the accent. Example: for amber accent, use `#111114` (neutral) or `#13120e` (warm).
- **surface**: One step lighter than background. Add 5-8% lightness.
- **primary**: Same as background or slightly darker.
- **text**: Off-white, not pure `#fff`. Use `#e8e6e3` or similar with a slight warm or cool bias matching the accent.

### Light theme decks

Invert the relationships:

- **background**: Near-white (`#fafafa` to `#f5f5f5`)
- **surface**: White (`#ffffff`)
- **primary**: The brand's darkest color
- **text**: Near-black (`#1a1a1a` to `#2a2a2a`)
- **accent**: The brand color (ensure 4.5:1 contrast against background)
- Derived text opacities use the text color base, not white
- Change `--color-border` to `rgba(0, 0, 0, 0.06)` instead of white-based

## Font pairing rules

- **Same family, weight contrast**: Use 800 heading, 400 body. Good for Inter, DM Sans, Plus Jakarta Sans.
- **Geometric heading + humanist body**: Sora or Space Grotesk headings, DM Sans or Source Sans body.
- **Serif heading + sans body**: Playfair Display or Fraunces headings, Inter or DM Sans body. For editorial or luxury brands.
- **Mono accent**: Always include a monospace font. JetBrains Mono, Fira Code, or Berkeley Mono.

Set all three in `brand.config.ts`. The layout injects them as `--font-heading`, `--font-body`, and `--font-mono`.

## Where brand tokens appear in slide code

```tsx
{/* Section label -- accent color, uppercase, wide tracking */}
<p className="section-label">Revenue</p>

{/* Title -- heading font inherited from body, tight tracking */}
<h2 className="text-[2.5rem] font-bold">ARR trajectory</h2>

{/* Body text -- secondary opacity */}
<p style={{ color: 'var(--color-text-secondary)' }}>Supporting detail</p>

{/* Stat number -- accent color with glow */}
<p className="stat-glow" style={{ color: 'var(--color-accent)' }}>$4.2M</p>

{/* Card surface for charts */}
<div className="card-surface p-8">...</div>

{/* Shape with brand colors */}
<SlideShape shape="hexagon" size={100}
  fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth={1.5} />
```

Never hardcode hex colors in slide content. Always use CSS variables.

## Gradient mesh backgrounds

For atmospheric depth, use radial gradients with the accent at low opacity:

```css
.bg-mesh-warm {
  background:
    radial-gradient(ellipse at 15% 60%, rgba(R, G, B, 0.07) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 25%, rgba(R, G, B, 0.03) 0%, transparent 40%),
    var(--color-background);
}
```

Replace R, G, B with the accent color's RGB components when rebranding.

## Checklist after rebranding

- [ ] Five colors set in `brand.config.ts`
- [ ] Derived colors updated in `globals.css`
- [ ] Font imports added to `globals.css`
- [ ] Three font stacks set in `brand.config.ts`
- [ ] Gradient mesh backgrounds updated with new accent RGB
- [ ] No hardcoded hex values in slide content (search for `#` in page.tsx)
- [ ] Accent color has at least 4.5:1 contrast against background
- [ ] Text color has at least 7:1 contrast against background

## Common mistakes

- Hardcoding `#f59e0b` instead of `var(--color-accent)` in slide files
- Editing `globals.css` colors instead of `brand.config.ts`
- Using pixel values for slide padding instead of `var(--slide-padding)`
- Using a font not declared in `brand.config.ts`
- Forgetting to update derived opacity colors after changing the base palette
