---
name: slide-organization
description: File structure conventions for organizing slides across multiple files with a manifest-based ordering system
---

# Slide organization

How to structure slide files so decks stay manageable as they grow. The runtime discovers slides via `querySelectorAll('[data-slide]')` in DOM order, so file structure is purely for human ergonomics. Use it well.

## The rule

One file per slide. One manifest that controls order.

```
app/
  page.tsx              # Manifest: imports slides, defines order
  slides/
    01-title.tsx
    02-problem.tsx
    03-solution.tsx
    04-demo.tsx
    05-pricing.tsx
    06-close.tsx
```

## The manifest

`page.tsx` imports every slide component and renders them in order. This is the only file you touch to reorder the deck.

```tsx
import Title from './slides/01-title'
import Problem from './slides/02-problem'
import Solution from './slides/03-solution'
import Demo from './slides/04-demo'
import Pricing from './slides/05-pricing'
import Close from './slides/06-close'

export default function Deck() {
  return (
    <main>
      <Title />
      <Problem />
      <Solution />
      <Demo />
      <Pricing />
      <Close />
    </main>
  )
}
```

Reordering slides means moving one line. Adding a slide means creating a file and adding one import.

## Slide file format

Each file exports a default component that renders exactly one `<section data-slide="">`.

```tsx
// app/slides/03-solution.tsx

export default function Solution() {
  return (
    <section data-slide="">
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-4xl px-16">
          <h2 className="text-4xl font-bold">Our approach</h2>
          <ul className="mt-8 space-y-4 text-xl">
            <li data-step="">Ship faster with fewer resources</li>
            <li data-step="">Measure what matters automatically</li>
            <li data-step="">Iterate based on real audience data</li>
          </ul>
          <div data-notes="">
            Pause after each bullet. Let the audience absorb before advancing.
          </div>
        </div>
      </div>
    </section>
  )
}
```

Keep each slide file focused on content. If a slide needs complex interactive behavior (charts, live polls, embedded demos), that logic lives in the slide file or in a component imported by it.

## Naming conventions

### File names

Use numbered prefixes for filesystem sorting: `01-title.tsx`, `02-problem.tsx`. The numbers match deck order so `ls slides/` reads like an outline.

When you insert a slide between 03 and 04, name it `03b-transition.tsx` or renumber. Renumbering is cleaner but either works. The numbers are for humans, not the runtime.

### Component names

Name the component after the slide's purpose, not its position:

```tsx
// Good: describes what the slide is about
export default function RevenueGrowth() { ... }
export default function ProductDemo() { ... }
export default function TeamIntro() { ... }

// Bad: positional names break when you reorder
export default function Slide3() { ... }
export default function SecondSlide() { ... }
```

## When to split

Start with everything in `page.tsx` for very short decks (3-5 slides). Split into separate files when any of these happen:

- The deck has more than 5 slides
- Any single slide has more than 40 lines of JSX
- A slide contains interactive components or complex logic
- Multiple people are working on different slides
- You want to see deck structure at a glance in the file explorer

## Multi-slide components

Sometimes a group of slides shares data or state (a section with consistent theming, a multi-slide demo flow). Group them in one file that exports multiple `data-slide` sections:

```tsx
// app/slides/04-demo.tsx

export default function DemoSection() {
  const metrics = { users: 12400, revenue: '$4.2M', growth: '127%' }

  return (
    <>
      <section data-slide="">
        <h2>The numbers</h2>
        <p className="text-6xl font-bold">{metrics.users.toLocaleString()} users</p>
      </section>
      <section data-slide="">
        <h2>Revenue</h2>
        <p className="text-6xl font-bold">{metrics.revenue}</p>
        <p data-step="" className="text-2xl mt-4">{metrics.growth} YoY</p>
      </section>
    </>
  )
}
```

This is fine. The runtime counts each `data-slide` element independently. The manifest still shows one import for the group.

## Reordering slides

To reorder, move the import line in `page.tsx`:

```tsx
// Before: Demo after Solution
<Solution />
<Demo />
<Pricing />

// After: Demo before Solution
<Demo />
<Solution />
<Pricing />
```

Optionally renumber the files to keep filesystem order in sync. This is cosmetic but reduces confusion when someone opens the `slides/` directory.

## Adding a slide

1. Create the file: `app/slides/07-next-steps.tsx`
2. Write the component with `<section data-slide="">`
3. Import it in `page.tsx` and place it where you want in the JSX

## Removing a slide

1. Remove the import and JSX line from `page.tsx`
2. Delete the file from `slides/`

## What the LLM should do

When generating a new deck or adding slides to an existing one:

- Always use the multi-file structure described above
- Never put more than one slide's content in `page.tsx` directly
- Keep `page.tsx` as a clean manifest with imports and render order
- Name slide files with numbered prefixes matching their position
- Name components after their content, not their position
- When the user asks to reorder slides, update `page.tsx` and optionally renumber files
- When the user asks to add a slide, create a new file and add one import to the manifest
