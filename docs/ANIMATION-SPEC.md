# Animation system spec

SlideNerds should match or exceed the animation capabilities of Keynote, PowerPoint, and Google Slides -- but implemented as CSS classes and data attributes that work in the browser.

## Current state

The template CSS (`packages/slide-nerds/templates/next-app/app/globals.css.tmpl`) has 12 animation classes:

**Step animations (6):** step-fade, step-move-up, step-scale-in, step-move-left, step-pop, step-wipe-right

**Emphasis (1):** step-emphasis (spring scale)

**Auto-build (5):** auto-fade, auto-pop, auto-wipe-right, auto-slide-down, auto-slide-up

This is far short of feature parity. Keynote has ~40 entrance effects, PowerPoint has ~50+, and even Google Slides has ~8.

## Target state

Implement a comprehensive animation library covering four categories: entrance (build-in), exit (build-out), emphasis, and slide transitions. All animations are pure CSS, applied via class names on `data-step` elements or slide sections.

## Architecture

All animations live in `globals.css.tmpl`. They follow the existing pattern:

- **Step (entrance) animations:** Applied to `[data-step]` elements. Hidden by default (`visibility: hidden; opacity: 0`). Runtime adds `.step-visible` class on advance.
- **Exit animations:** Applied to `[data-step]` elements with a separate exit trigger. Runtime adds `.step-exit` class.
- **Emphasis animations:** Applied to any visible element. Triggered via `.step-emphasis-*` classes or by the runtime on a second click.
- **Auto-build animations:** Applied via `.auto-*` classes. Animate when the parent slide gets `.active` class.
- **Slide transitions:** Applied to `[data-slide]` via `data-transition` attribute. Runtime manages `.entering` and `.exiting` classes.

### Naming convention

All class names use kebab-case prefixed by category:

- `step-*` for entrance animations (click to reveal)
- `exit-*` for exit animations
- `emphasis-*` for emphasis animations
- `auto-*` for auto-build (animate on slide enter)
- No prefix needed for slide transitions (use `data-transition` attribute)

### Duration

Every animation class should support an optional duration modifier via CSS custom property `--anim-duration`. Default durations are set per animation. Users can override:

```css
.step-fly-in-left { --anim-duration: 600ms; }
```

Or per-element via inline style:

```html
<div data-step="" class="step-fly-in-left" style="--anim-duration: 300ms">Fast</div>
```

### Delay

Staggered delays use `animation-delay` or `transition-delay` via inline styles:

```html
<div data-step="" class="step-fade" style="transition-delay: 200ms">Delayed</div>
```

---

## Entrance animations (step-*)

Implement all of these. Each is a class on a `[data-step]` element.

### Fades

| Class | Effect | Duration |
|-------|--------|----------|
| `step-fade` | Opacity 0 to 1 | 350ms |
| `step-fade-slow` | Opacity 0 to 1, slower | 700ms |
| `step-dissolve` | Pixel-level dissolve (uses filter) | 500ms |

### Slides and flies

| Class | Effect | Duration |
|-------|--------|----------|
| `step-move-up` | Translate up 24px + fade | 420ms |
| `step-move-down` | Translate down 24px + fade | 420ms |
| `step-move-left` | Translate left 30px + fade | 400ms |
| `step-move-right` | Translate right 30px + fade | 400ms |
| `step-fly-in-left` | Fly in from far left (off-screen) | 500ms |
| `step-fly-in-right` | Fly in from far right (off-screen) | 500ms |
| `step-fly-in-top` | Fly in from above (off-screen) | 500ms |
| `step-fly-in-bottom` | Fly in from below (off-screen) | 500ms |
| `step-float-up` | Gentle float up with ease-out | 600ms |
| `step-float-down` | Gentle float down with ease-out | 600ms |

### Scales and zooms

| Class | Effect | Duration |
|-------|--------|----------|
| `step-scale-in` | Scale from 0.92 to 1 + fade | 350ms |
| `step-scale-up` | Scale from 0.5 to 1 + fade | 400ms |
| `step-scale-down` | Scale from 1.5 to 1 + fade | 400ms |
| `step-zoom-in` | Scale from 0 to 1 (zoom from nothing) | 450ms |
| `step-zoom-in-rotate` | Zoom in with 90deg rotation | 500ms |
| `step-grow` | Scale from 0 to 1 with overshoot bounce | 500ms |

### Pops and bounces

| Class | Effect | Duration |
|-------|--------|----------|
| `step-pop` | Scale 0.6 to 1 with spring overshoot | 400ms |
| `step-bounce` | Drop in from above with bounce at landing | 600ms |
| `step-bounce-left` | Bounce in from left | 600ms |
| `step-bounce-right` | Bounce in from right | 600ms |
| `step-elastic` | Scale with elastic spring (large overshoot) | 700ms |
| `step-drop` | Drop from above with gravity deceleration | 500ms |
| `step-rise` | Rise from below with deceleration | 500ms |

### Spins and flips

| Class | Effect | Duration |
|-------|--------|----------|
| `step-spin-in` | Rotate 360deg while fading in | 600ms |
| `step-spin-in-slow` | Rotate 720deg while fading in | 1000ms |
| `step-flip-x` | Flip in along horizontal axis (3D) | 500ms |
| `step-flip-y` | Flip in along vertical axis (3D) | 500ms |
| `step-swing-in` | Swing in from top like a hinged sign | 600ms |
| `step-rotate-in` | Rotate from -90deg to 0 + fade | 400ms |

### Wipes and reveals

| Class | Effect | Duration |
|-------|--------|----------|
| `step-wipe-right` | Clip-path wipe from left to right | 500ms |
| `step-wipe-left` | Clip-path wipe from right to left | 500ms |
| `step-wipe-up` | Clip-path wipe from bottom to top | 500ms |
| `step-wipe-down` | Clip-path wipe from top to bottom | 500ms |
| `step-iris` | Circular clip-path expanding from center | 500ms |
| `step-diamond-reveal` | Diamond-shaped clip-path expanding from center | 500ms |
| `step-split-horizontal` | Clip-path opening from center horizontally | 500ms |
| `step-split-vertical` | Clip-path opening from center vertically | 500ms |

### Blur and filter

| Class | Effect | Duration |
|-------|--------|----------|
| `step-blur-in` | Blur 10px to 0 + fade | 400ms |
| `step-unblur` | Blur 20px to 0 (no fade, just deblur) | 500ms |
| `step-brightness` | Brightness 0 to 1 (dark to normal) | 400ms |
| `step-saturate` | Grayscale to full color | 500ms |

### Text-specific

| Class | Effect | Duration |
|-------|--------|----------|
| `step-typewriter` | Characters appear one at a time (CSS animation) | 1000ms |
| `step-text-reveal` | Text clips from left to right per line | 600ms |
| `step-letter-spread` | Letters spread from compressed to normal spacing | 500ms |

### Slides and glides

| Class | Effect | Duration |
|-------|--------|----------|
| `step-slide-in-left` | Slide in from left edge + fade, smooth ease | 500ms |
| `step-slide-in-right` | Slide in from right edge + fade | 500ms |
| `step-glide-up` | Smooth glide up with deceleration | 500ms |
| `step-glide-down` | Smooth glide down with deceleration | 500ms |
| `step-peek-left` | Peek in from left (partial reveal) | 400ms |
| `step-peek-right` | Peek in from right | 400ms |

**Total entrance animations: ~55**

---

## Exit animations (exit-*)

Mirror of entrance animations. Runtime adds `.step-exit` class to trigger these.

| Class | Effect |
|-------|--------|
| `exit-fade` | Fade out |
| `exit-move-up` | Move up + fade |
| `exit-move-down` | Move down + fade |
| `exit-move-left` | Move left + fade |
| `exit-move-right` | Move right + fade |
| `exit-fly-out-left` | Fly off-screen left |
| `exit-fly-out-right` | Fly off-screen right |
| `exit-fly-out-top` | Fly off-screen top |
| `exit-fly-out-bottom` | Fly off-screen bottom |
| `exit-scale-down` | Shrink to 0 |
| `exit-scale-up` | Grow to 1.5x and fade |
| `exit-zoom-out` | Zoom to 0 |
| `exit-spin-out` | Rotate 360deg while fading out |
| `exit-flip-x` | Flip out along horizontal axis |
| `exit-flip-y` | Flip out along vertical axis |
| `exit-wipe-left` | Wipe away to the left |
| `exit-wipe-right` | Wipe away to the right |
| `exit-wipe-up` | Wipe away upward |
| `exit-wipe-down` | Wipe away downward |
| `exit-iris` | Circular clip-path shrinking to center |
| `exit-blur` | Blur 0 to 20px + fade |
| `exit-drop-off` | Drop with gravity acceleration |
| `exit-bounce-off` | Bounce off bottom edge |
| `exit-pop` | Pop out with scale overshoot |
| `exit-shrink-rotate` | Shrink + rotate and vanish |
| `exit-dissolve` | Pixel dissolve out |

**Total exit animations: ~26**

---

## Emphasis animations (emphasis-*)

Applied to visible elements. Can be triggered by the runtime on a second advance or via JavaScript.

| Class | Effect | Duration |
|-------|--------|----------|
| `emphasis-pulse` | Scale 1 to 1.1 and back (heartbeat) | 600ms |
| `emphasis-bounce` | Bounce in place (translateY) | 500ms |
| `emphasis-shake` | Horizontal shake (translateX oscillation) | 400ms |
| `emphasis-wobble` | Wobble (rotate oscillation) | 600ms |
| `emphasis-jiggle` | Quick jiggle (small rapid movements) | 300ms |
| `emphasis-rubber-band` | Stretch horizontally then snap back | 500ms |
| `emphasis-swing` | Pendulum swing (rotate from top center) | 700ms |
| `emphasis-tada` | Scale + slight rotate with overshoot | 700ms |
| `emphasis-heartbeat` | Two-beat pulse (like a heartbeat) | 800ms |
| `emphasis-flash` | Quick opacity flash (1 to 0 to 1) | 400ms |
| `emphasis-spin` | Full 360deg rotation | 600ms |
| `emphasis-float` | Float up 8px and back | 600ms |
| `emphasis-glow` | Box-shadow glow pulse | 800ms |
| `emphasis-color-pulse` | Background color pulse (via CSS custom property) | 600ms |
| `emphasis-teeter` | Rock left-right like a seesaw | 500ms |
| `emphasis-flicker` | Rapid opacity flicker | 300ms |
| `emphasis-grow` | Scale to 1.2x and stay | 300ms |
| `emphasis-shrink` | Scale to 0.8x and stay | 300ms |

**Total emphasis animations: ~18**

---

## Auto-build animations (auto-*)

Trigger automatically when the slide becomes active. No click needed.

| Class | Effect | Duration |
|-------|--------|----------|
| `auto-fade` | Fade in on slide enter | 350ms |
| `auto-slide-up` | Slide up + fade on enter | 420ms |
| `auto-slide-down` | Slide down + fade on enter | 420ms |
| `auto-slide-left` | Slide left + fade on enter | 420ms |
| `auto-slide-right` | Slide right + fade on enter | 420ms |
| `auto-pop` | Pop with spring overshoot on enter | 400ms |
| `auto-scale-in` | Scale from 0.8 to 1 + fade on enter | 350ms |
| `auto-zoom-in` | Scale from 0 to 1 on enter | 450ms |
| `auto-wipe-right` | Clip-path wipe on enter | 500ms |
| `auto-wipe-left` | Clip-path wipe on enter | 500ms |
| `auto-blur-in` | Blur to clear on enter | 400ms |
| `auto-fly-in-left` | Fly in from off-screen left on enter | 500ms |
| `auto-fly-in-right` | Fly in from off-screen right on enter | 500ms |
| `auto-bounce` | Bounce in from above on enter | 600ms |
| `auto-spin-in` | Spin in on enter | 600ms |
| `auto-flip-x` | Flip in on X axis on enter | 500ms |

**Total auto-build animations: ~16**

---

## Slide transitions

Applied via `data-transition` attribute on `[data-slide]`. Runtime manages `.entering` and `.exiting` classes.

```html
<section data-slide="" data-transition="push-left">
```

### Implementation

The runtime needs to support slide transitions. When navigating forward:
1. Current slide gets `.exiting` + transition class applied
2. Next slide gets `.entering` + transition class applied
3. After transition duration, classes are removed

### Transitions to implement

| Value for `data-transition` | Effect |
|-----------------------------|--------|
| `fade` | Cross-fade between slides |
| `dissolve` | Dissolve transition |
| `push-left` | Next slide pushes from right, current exits left |
| `push-right` | Next slide pushes from left, current exits right |
| `push-up` | Next slide pushes from bottom |
| `push-down` | Next slide pushes from top |
| `slide-left` | Current slides left, next slides in from right |
| `slide-right` | Current slides right, next slides in from left |
| `cover-left` | Next slide covers current from right |
| `cover-right` | Next slide covers current from left |
| `cover-up` | Next slide covers from bottom |
| `cover-down` | Next slide covers from top |
| `uncover-left` | Current uncovers to left, revealing next |
| `uncover-right` | Current uncovers to right |
| `zoom-in` | Next slide zooms in from center |
| `zoom-out` | Current slide zooms out, next appears |
| `flip-x` | 3D flip along horizontal axis |
| `flip-y` | 3D flip along vertical axis |
| `cube-left` | 3D cube rotation left |
| `cube-right` | 3D cube rotation right |
| `wipe-left` | Wipe from right to left |
| `wipe-right` | Wipe from left to right |
| `wipe-up` | Wipe from bottom to top |
| `wipe-down` | Wipe from top to bottom |
| `iris` | Circular iris opening |
| `split-horizontal` | Split open horizontally from center |
| `split-vertical` | Split open vertically from center |
| `morph` | Same as Magic Move (handled by runtime, not CSS) |

**Total slide transitions: ~27**

---

## Implementation plan

### Phase 1: Entrance animations (highest value)

File: `packages/slide-nerds/templates/next-app/app/globals.css.tmpl`

1. Add all ~55 step-* entrance animation classes
2. Update the `.step-visible` rule to handle all transform/clip-path resets
3. Group by category with clear comment blocks
4. Test each animation in a test deck

### Phase 2: Exit animations

1. Add the `.step-exit` class handling to the CSS
2. Add all ~26 exit-* classes
3. Update the runtime (`use-slide-navigation.ts`) to support exit animations on step backward
4. Test backward navigation

### Phase 3: Emphasis animations

1. Add all ~18 emphasis-* classes as keyframe animations
2. These use `animation` property (not `transition`) since they are fire-and-forget
3. Update runtime to support emphasis trigger (optional: on second advance of same step)

### Phase 4: Auto-build animations

1. Expand the existing auto-* set from 5 to ~16
2. Follow the existing pattern: element has initial hidden state, keyframe runs when parent slide gets `.active`

### Phase 5: Slide transitions

1. Add transition CSS for ~27 transition types
2. Update the runtime's slide navigation to read `data-transition` and apply `.entering`/`.exiting` classes
3. This requires runtime changes, not just CSS

### Phase 6: Runtime changes

1. `use-slide-navigation.ts`: Read `data-transition` from each slide section
2. When navigating, apply entering/exiting classes with proper timing
3. Support `step-exit` class for exit animations
4. Support emphasis re-trigger on second click

### Phase 7: Update docs and skills

1. Update the animation skill (`skills/animation/SKILL.md`) with all new classes
2. Update the slide definition reference page (`apps/web/src/app/(marketing)/docs/reference/page.tsx`)
3. Update README animation table

---

## Files to modify

| File | Changes |
|------|---------|
| `packages/slide-nerds/templates/next-app/app/globals.css.tmpl` | Add all animation CSS |
| `packages/runtime/src/use-slide-navigation.ts` | Slide transitions, exit support, emphasis |
| `packages/slide-nerds/src/runtime/use-slide-navigation.ts` | Same (copy) |
| `skills/animation/SKILL.md` | Document all animations |
| `packages/slide-nerds/skills/animation/SKILL.md` | Same (copy) |
| `apps/web/src/app/(marketing)/docs/reference/page.tsx` | Update tables |
| `README.md` | Update animation table |

---

## Total animation count

| Category | Count |
|----------|-------|
| Entrance (step-*) | ~55 |
| Exit (exit-*) | ~26 |
| Emphasis (emphasis-*) | ~18 |
| Auto-build (auto-*) | ~16 |
| Slide transitions | ~27 |
| **Total** | **~142** |

This puts SlideNerds well ahead of Google Slides (~30 total), on par with Keynote (~100), and approaching PowerPoint (~200+ including motion paths).

Motion paths are excluded from this spec. They require JavaScript animation (not CSS alone) and are a separate feature. They can be implemented later using the Web Animations API or a library like GSAP.
