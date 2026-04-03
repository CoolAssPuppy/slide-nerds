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

The runtime sets visible state when the step is active. Add visible-state overrides in your deck CSS where needed:

```css
[data-step][data-step-visible='true'] {
  visibility: visible;
  opacity: 1;
  transform: translateY(0) scale(1);
}
```

If your app does not expose `data-step-visible`, mirror the same effect with the runtime's default visible selectors.

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

## Magic Move emulation (slide to slide)

True Keynote Magic Move interpolates identical objects between slides. The runtime does not perform cross-slide tweening by default, so use this repeatable emulation protocol.

### Protocol

1. Duplicate the source slide into the destination slide.
2. Keep object identity stable with `data-magic-id` per object.
3. Keep typography tokens and brand colors identical.
4. Change only geometry and opacity between source and destination.
5. Put destination-only objects behind `data-step` on the destination slide.

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
