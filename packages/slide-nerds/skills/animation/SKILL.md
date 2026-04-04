---
name: animation
description: Step-by-step reveal and transition patterns for slidenerds slides
---

# Animation skill

Use this skill when a deck needs motion, sequencing, or narrative pacing. The runtime exposes one core control surface: `data-step`. Every animation in this skill maps to deterministic HTML, CSS, and step order.

## Runtime contract

- Every slide is a `section` with `data-slide`.
- Every revealable element has `data-step`.
- The runtime toggles hidden and visible state by step index.
- The presenter controls pace through keyboard or click.

Do not rely on autoplay animation timelines for core meaning. If animation carries meaning, tie it to `data-step`.

## Keynote-style animation support matrix

This table maps classic Apple Keynote patterns to reliable slidenerds implementations.

| Keynote family   | Effects to support                       | slidenerds implementation                                      |
| ---------------- | ---------------------------------------- | -------------------------------------------------------------- |
| Build in         | Appear, Fade In, Move In, Scale In       | `data-step` + CSS opacity, transform, scale transitions        |
| Build out        | Disappear, Fade Out, Move Out, Scale Out | Pair old/new layers across consecutive `data-step` wrappers    |
| Action           | Move, Rotate, Pulse, Color emphasis      | `data-step` wrapper with CSS transitions on transform/color    |
| Emphasis         | Pulse, Highlight, Bounce                 | Short CSS keyframes triggered when step becomes visible        |
| Slide transition | Dissolve, Push, Wipe style feel          | Simulate with full-bleed transition elements on entering slide |
| Magic Move       | Object morph between slides              | Use the disciplined Magic Move emulation pattern below         |

## Animation primitives

Use these classes globally in deck CSS.

```css
[data-step] {
  visibility: hidden;
  opacity: 0;
}

[data-step].step-fade {
  transition:
    opacity 280ms ease,
    visibility 280ms ease;
}

[data-step].step-move-up {
  transform: translateY(16px);
  transition:
    opacity 320ms ease,
    transform 320ms ease,
    visibility 320ms ease;
}

[data-step].step-scale-in {
  transform: scale(0.96);
  transition:
    opacity 260ms ease,
    transform 260ms ease,
    visibility 260ms ease;
}

[data-step].step-emphasis {
  animation: emphasis-pulse 360ms ease-out 1;
}

@keyframes emphasis-pulse {
  0% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.04);
  }
  100% {
    transform: scale(1);
  }
}
```

The runtime toggles the `.step-visible` class when the step is active. The visible state override:

```css
[data-step].step-visible {
  visibility: visible !important;
  opacity: 1 !important;
  transform: translateY(0) translateX(0) scale(1) !important;
}
```

For emphasis entrance on big stats, combine with the `step-emphasis` class:

```css
[data-step].step-emphasis.step-visible {
  animation: emphasis-land 500ms cubic-bezier(0.16, 1, 0.3, 1) 1;
}

@keyframes emphasis-land {
  0% { transform: scale(0.85); opacity: 0; }
  60% { transform: scale(1.03); }
  100% { transform: scale(1); opacity: 1; }
}
```

## Build in patterns

### Fade in list items

```tsx
<ul className="space-y-3 text-xl">
  <li data-step="" className="step-fade">
    Problem is urgent
  </li>
  <li data-step="" className="step-fade">
    Solution is differentiated
  </li>
  <li data-step="" className="step-fade">
    Market timing is favorable
  </li>
</ul>
```

### Move in diagram nodes

```tsx
<div className="grid grid-cols-3 gap-6">
  <div data-step="" className="step-move-up rounded-xl p-6">
    Acquire
  </div>
  <div data-step="" className="step-move-up rounded-xl p-6">
    Activate
  </div>
  <div data-step="" className="step-move-up rounded-xl p-6">
    Expand
  </div>
</div>
```

## Build out patterns

Use paired layers. First step shows current object, next step shows replacement object in target state.

```tsx
<div className="relative h-48">
  <div data-step="" className="step-fade absolute inset-0">
    Current pricing: $49
  </div>
  <div data-step="" className="step-fade absolute inset-0">
    New pricing: $99
  </div>
</div>
```

## Action and emphasis patterns

### Emphasize one metric without changing slide

```tsx
<div data-step="" className="text-6xl font-bold step-emphasis">
  143%
</div>
```

### Animated chart reveal

```tsx
<div data-step="" className="step-fade">
  <ResponsiveContainer width="100%" height={360}>
    <BarChart data={revenueData}>
      <XAxis dataKey="quarter" />
      <YAxis />
      <Bar dataKey="arr" fill="var(--color-accent)" animationDuration={700} />
    </BarChart>
  </ResponsiveContainer>
</div>
```

## Magic Move (slide to slide)

The runtime performs automatic FLIP animation between slides for elements that share a `data-magic-id`. When navigating from one slide to the next, elements with matching IDs animate smoothly from their old position, size, and scale to their new position.

### Protocol

1. Give shared elements the same `data-magic-id` value on both slides.
2. Keep typography tokens and brand colors identical across source and destination.
3. Change geometry (position, size) between source and destination -- the runtime animates the difference.
4. Put destination-only objects behind `data-step` on the destination slide.
5. The FLIP animation runs at 500ms with a cubic-bezier(0.4, 0, 0.2, 1) easing.

### Source slide

```tsx
<section data-slide="">
  <div className="relative min-h-screen" style={{ padding: 'var(--slide-padding)' }}>
    <div data-magic-id="logo" className="absolute left-12 top-10">
      Logo
    </div>
    <div data-magic-id="hero-chart" className="absolute left-20 top-28 w-[460px]">
      Chart A
    </div>
    <h2 data-magic-id="headline" className="absolute left-20 bottom-24 text-5xl">
      Before
    </h2>
  </div>
</section>
```

### Destination slide

```tsx
<section data-slide="">
  <div className="relative min-h-screen" style={{ padding: 'var(--slide-padding)' }}>
    <div data-magic-id="logo" className="absolute right-12 top-10">
      Logo
    </div>
    <div data-magic-id="hero-chart" className="absolute left-16 top-20 w-[760px]">
      Chart B
    </div>
    <h2 data-magic-id="headline" className="absolute left-16 bottom-16 text-6xl">
      After
    </h2>
    <p data-step="" className="step-fade absolute right-16 bottom-16">
      Narration detail appears on click
    </p>
  </div>
</section>
```

### Magic Move quality checklist

- Same object names and semantic roles across both slides
- No random spacing changes outside intended movement
- Motion supports story progression, not decoration
- Presenter can explain the transform in one sentence

## Transition overlays for slide changes

To mimic dissolve or wipe feeling, reveal a transition layer as the first step on the destination slide.

```tsx
<section data-slide="">
  <div data-step="" className="step-fade absolute inset-0 bg-black/20" />
  <div style={{ padding: 'var(--slide-padding)' }}>
    <h2 className="text-5xl">New section</h2>
  </div>
</section>
```

## Auto-build animations

Auto-build animations trigger when a slide loads, with no click required. Use them for visual polish on slides where the content doesn't need pacing control.

### Available classes

| Class | Effect | Duration |
|-------|--------|----------|
| `auto-fade` | Fade in | 350ms |
| `auto-pop` | Scale up with overshoot bounce | 400ms |
| `auto-wipe-right` | Clip-path reveal left to right | 500ms |
| `auto-slide-down` | Slide down from above + fade | 500ms |
| `auto-slide-up` | Slide up from below + fade | 500ms |

### Staggering

Control stagger with inline `animationDelay`:

```tsx
{items.map((item, i) => (
  <div key={item.id} className="auto-pop card-surface p-5"
    style={{ animationDelay: `${200 + i * 100}ms` }}>
    {item.content}
  </div>
))}
```

### Directional grid pattern

For grids, use opposing directions by row for a "closing curtain" effect:

```tsx
{items.map((item) => (
  <div key={item.id}
    className={`${item.row === 0 ? 'auto-slide-down' : 'auto-slide-up'} card-surface`}
    style={{ animationDelay: '400ms' }}>
    {item.content}
  </div>
))}
```

### When to use auto-build vs click-to-reveal

- **Auto-build**: KPI grids, case study cards, icon grids, badge lists, product cards. Slides where the visual entrance is the point, not the pacing.
- **Click-to-reveal**: Bullet lists, table rows, comparison reveals, any content where the presenter wants to control the narrative.
- **Hybrid**: Use `data-auto-step` for elements that auto-reveal, then `data-step` for elements that wait for clicks. Auto-steps play first, then manual steps take over.

## Exit animations

Exit animations trigger when navigating away from a slide. The runtime adds `.exiting` to the slide and waits 400ms before transitioning.

### Auto exits

Add exit classes directly to elements. They animate when the slide gets `.exiting`:

| Class | Effect | Duration |
|-------|--------|----------|
| `exit-fade` | Fade out | 400ms |
| `exit-scale-out` | Scale down + fade out | 400ms |
| `exit-slide-up` | Slide up + fade out | 400ms |
| `exit-slide-down` | Slide down + fade out | 400ms |
| `exit-wipe-left` | Clip-path collapse right to left | 400ms |

### Author-controlled exits

Use `data-exit-step` for sequenced exits. After all entrance steps are revealed, subsequent clicks reveal exit steps (applying `exit-visible`), then transition to the next slide.

```tsx
<h2 data-exit-step="" className="exit-fade">This fades out before slide transition</h2>
<div data-exit-step="" className="exit-slide-up">This slides up after the h2 fades</div>
```

## Auto-step sequencing

Use `data-auto-step="300ms"` for steps that reveal automatically on a timer. The value is the delay before revealing. Mix with `data-step` for hybrid sequences.

```tsx
<div data-auto-step="200ms" className="step-fade">Reveals after 200ms</div>
<div data-auto-step="300ms" className="step-fade">Reveals 300ms after previous</div>
<div data-step="" className="step-move-up">Waits for click</div>
```

## Step groups

Use `data-step-group="name"` to reveal multiple elements with a single click. The runtime counts the group as one logical step.

```tsx
<div data-step="" data-step-group="metrics" className="step-pop"
  style={{ animationDelay: '0ms' }}>Revenue: $4.2M</div>
<div data-step="" data-step-group="metrics" className="step-pop"
  style={{ animationDelay: '100ms' }}>Growth: 142%</div>
<div data-step="" data-step-group="metrics" className="step-pop"
  style={{ animationDelay: '200ms' }}>Users: 50K</div>
```

## Animation QA checklist

- At least two distinct animation types in a deck: fade plus move, or fade plus scale
- At least one chart animation tied to `data-step`
- No animation duration above 800ms for presenter-controlled steps
- No infinite loops on content that appears in exports
- No clipping at common projector resolutions (1920x1080)

## Image and logo motion rules

- Avoid animating full-bleed background images with large scale transforms
- Animate logo opacity or small position shifts only
- Keep logo animation under 250ms
- Preserve contrast at all animation states

## What to avoid

- `backdrop-filter` and heavy blend modes, which degrade export reliability
- Delayed step transitions that make click timing ambiguous
- Parallel animations on more than 12 objects in one step
- Motion without narrative purpose
