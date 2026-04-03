---
name: animation
description: Step-by-step reveal and transition patterns for slidenerds slides
---

# Animation skill

Progressive reveal and transition patterns using the `data-step` convention. The runtime handles visibility toggling. This skill documents the CSS and structural patterns that make animations work.

## Progressive bullet reveal

The most common animation pattern. Each bullet appears on click:

```tsx
<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}>
    <h2 className="text-3xl font-semibold">Key findings</h2>
    <ul className="mt-8 space-y-4 text-xl">
      <li data-step="">Revenue grew 142% year over year</li>
      <li data-step="">Customer retention hit 98%</li>
      <li data-step="">NPS score reached 72</li>
    </ul>
  </div>
</section>
```

## Diagram build-up

Show diagram elements in sequence. Wrap each visual element in a `data-step` container:

```tsx
<section data-slide="">
  <div className="flex items-center justify-center gap-8 min-h-screen">
    <div data-step="" className="p-6 rounded-lg bg-surface text-center">
      <p className="font-bold">Input</p>
    </div>
    <div data-step="" className="text-2xl">&#8594;</div>
    <div data-step="" className="p-6 rounded-lg bg-surface text-center">
      <p className="font-bold">Process</p>
    </div>
    <div data-step="" className="text-2xl">&#8594;</div>
    <div data-step="" className="p-6 rounded-lg bg-surface text-center">
      <p className="font-bold">Output</p>
    </div>
  </div>
</section>
```

## CSS transitions for steps

The global CSS provides the base transition. For custom timing:

```css
[data-step] {
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}
```

For slide-up entrance:

```css
[data-step] {
  visibility: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.4s ease, visibility 0.4s ease, transform 0.4s ease;
}
```

The runtime sets `visibility: visible; opacity: 1` when a step is revealed. Add `transform: translateY(0)` to your visible state if using transform-based animations.

## Recharts animation on step entry

Wrap a Recharts chart in a `data-step` element. The chart renders when the step becomes visible:

```tsx
<div data-step="">
  <ResponsiveContainer width="100%" height={400}>
    <BarChart data={data}>
      <Bar dataKey="value" fill="var(--color-accent)" animationDuration={800} />
      <XAxis dataKey="name" />
      <YAxis />
    </BarChart>
  </ResponsiveContainer>
</div>
```

Recharts animates on mount. Since the step element starts hidden and becomes visible, the chart animation plays when the step is revealed.

## Mermaid diagram integration

Use Mermaid for diagrams. The diagram renders when the component mounts:

```tsx
import mermaid from 'mermaid'
import { useEffect, useRef } from 'react'

const MermaidDiagram = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      mermaid.initialize({ startOnLoad: false, theme: 'dark' })
      mermaid.run({ nodes: [ref.current] })
    }
  }, [chart])

  return <div ref={ref} className="mermaid">{chart}</div>
}
```

Wrap in `data-step` for progressive reveal:

```tsx
<div data-step="">
  <MermaidDiagram chart={`graph LR; A-->B; B-->C;`} />
</div>
```

## What to avoid

### Animations that break PDF export

- `backdrop-filter` (blur, brightness) -- not supported in print CSS
- Complex `mix-blend-mode` -- inconsistent in PDF renderers
- CSS `animation` with `infinite` duration -- creates a moving target for the PDF snapshot
- `transform: scale()` on slides -- can cause clipping in PDF

### Heavy animations

- Avoid animations longer than 800ms on steps. They slow down the presenter's flow.
- Avoid auto-playing animations that start without user action. The presenter controls the pace.
- Avoid `transition-delay` on steps. The runtime reveals steps immediately; delayed transitions feel broken.

## Stagger pattern

To stagger multiple items appearing one after another on a single step:

```tsx
<div data-step="">
  <div className="space-y-2">
    <p style={{ transitionDelay: '0ms' }}>First item</p>
    <p style={{ transitionDelay: '100ms' }}>Second item</p>
    <p style={{ transitionDelay: '200ms' }}>Third item</p>
  </div>
</div>
```

All items appear on one click, but stagger visually. This is different from putting `data-step` on each item, which requires a separate click for each.
