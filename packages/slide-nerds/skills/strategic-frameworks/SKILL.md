---
name: strategic-frameworks
description: SWOT, 2x2 matrix, TAM/SAM/SOM, pricing comparison, risk matrix, pyramid, and other consulting-style slide patterns
---

# Strategic frameworks skill

Use this skill when a slide needs a structured analytical framework. These are the standard visual formats used in consulting, board, strategy, and executive presentations. Each pattern here is a complete slide recipe using HTML/CSS and Tailwind.

## SWOT matrix

Use for: situational analysis, strategic planning, competitive assessment.

A 2x2 grid with color-coded quadrants. Strengths and opportunities are positive (accent). Weaknesses and threats are cautionary (muted).

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Analysis</p>
    <h2 className="text-[2.5rem] font-bold mb-10">SWOT analysis</h2>
    <div className="grid grid-cols-2 gap-3" style={{ maxWidth: 900 }}>
      {[
        { title: 'Strengths', items: ['5-minute deploys', 'Best-in-class API', '98% retention'], color: 'var(--color-accent)', bg: 'var(--color-accent-dim)' },
        { title: 'Weaknesses', items: ['Small sales team', 'No enterprise tier', 'US-only'], color: 'var(--color-text-secondary)', bg: 'var(--color-surface)' },
        { title: 'Opportunities', items: ['EU expansion', 'Partner channel', 'AI integration'], color: 'var(--color-accent)', bg: 'var(--color-accent-dim)' },
        { title: 'Threats', items: ['AWS building competitor', 'Price pressure', 'Talent market'], color: 'var(--color-text-secondary)', bg: 'var(--color-surface)' },
      ].map((q) => (
        <div key={q.title} data-step="" className="step-fade rounded-xl p-5"
          style={{ background: q.bg, border: '1px solid var(--color-border)' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: q.color }}>{q.title}</p>
          <ul className="space-y-1.5">
            {q.items.map((item) => (
              <li key={item} className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>
```

### SWOT rules

- 3-4 items per quadrant. More is noise.
- Strengths and Opportunities use accent color. Weaknesses and Threats use muted color.
- Reveal quadrants one at a time with `data-step`.
- Items are short phrases, not sentences.

## Generic 2x2 matrix

Use for: effort/impact analysis, urgency/importance, build vs buy.

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center items-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <h2 className="text-[2.5rem] font-bold mb-10">Prioritization matrix</h2>
    <div className="relative" style={{ width: 600, height: 500 }}>
      {/* Axis labels */}
      <p className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold tracking-[0.15em] uppercase"
        style={{ color: 'var(--color-text-tertiary)' }}>Impact</p>
      <p className="absolute bottom-[-2rem] left-1/2 -translate-x-1/2 text-xs font-semibold tracking-[0.15em] uppercase"
        style={{ color: 'var(--color-text-tertiary)' }}>Effort</p>

      {/* Grid lines */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'var(--color-border)' }} />
      <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: 'var(--color-border)' }} />

      {/* Quadrant labels */}
      <p className="absolute top-4 left-4 text-xs font-semibold"
        style={{ color: 'var(--color-accent)' }}>Quick wins</p>
      <p className="absolute top-4 right-4 text-xs font-semibold"
        style={{ color: 'var(--color-text-tertiary)' }}>Big bets</p>
      <p className="absolute bottom-4 left-4 text-xs font-semibold"
        style={{ color: 'var(--color-text-tertiary)' }}>Fill-ins</p>
      <p className="absolute bottom-4 right-4 text-xs font-semibold"
        style={{ color: 'var(--color-text-tertiary)', opacity: 0.5 }}>Avoid</p>

      {/* Positioned items */}
      <div className="absolute" style={{ left: '15%', top: '15%' }}>
        <div data-step="" className="step-scale-in card-surface px-3 py-1.5 text-xs font-medium"
          style={{ border: '1px solid var(--color-accent)' }}>SSO integration</div>
      </div>
      <div className="absolute" style={{ left: '60%', top: '20%' }}>
        <div data-step="" className="step-scale-in card-surface px-3 py-1.5 text-xs font-medium">EU expansion</div>
      </div>
      {/* More items positioned by their effort/impact coordinates */}
    </div>
  </div>
</section>
```

### 2x2 rules

- Position items as absolutely-placed elements using percentage coordinates.
- Use `card-surface` pills for item labels.
- Highlight the "Quick wins" quadrant with accent color.
- Axis labels on the outside edges.
- The quadrant lines use `var(--color-border)` at default opacity.

## TAM / SAM / SOM

Use for: market sizing in investor pitches and strategy decks.

Concentric circles with the largest (TAM) on the outside:

```tsx
<section data-slide="">
  <div className="flex items-center justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <div className="flex items-center gap-16">
      <div className="relative" style={{ width: 400, height: 400 }}>
        {[
          { label: 'TAM', value: '$24B', size: 380, opacity: 0.08 },
          { label: 'SAM', value: '$4.8B', size: 260, opacity: 0.12 },
          { label: 'SOM', value: '$240M', size: 140, opacity: 0.2 },
        ].map((ring, i) => (
          <div key={ring.label} data-step="" className="step-scale-in absolute rounded-full flex items-center justify-center"
            style={{
              width: ring.size,
              height: ring.size,
              top: (400 - ring.size) / 2,
              left: (400 - ring.size) / 2,
              background: `rgba(245,158,11,${ring.opacity})`,
              border: '1px solid var(--color-accent)',
              borderColor: `rgba(245,158,11,${ring.opacity + 0.15})`,
            }}>
            {i === 2 && (
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{ring.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>{ring.label}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="space-y-6">
        {[
          { label: 'TAM', value: '$24B', desc: 'Total developer tools market' },
          { label: 'SAM', value: '$4.8B', desc: 'Cloud deployment automation segment' },
          { label: 'SOM', value: '$240M', desc: 'SMB + mid-market, US + EU' },
        ].map((item) => (
          <div key={item.label} data-step="" className="step-fade">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>{item.label}: {item.value}</p>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

## Pricing comparison (3-tier)

Use for: plan comparison, product editions, service tiers.

See the advanced-layouts skill for the full three-option comparison pattern. Key additions for pricing:

- Center column is taller and has an accent border.
- "Most popular" or "Recommended" badge on the center.
- Price is the largest text in each card.
- Feature list uses checkmarks in accent color.
- CTA button at the bottom of each card (optional for internal decks).

## Process chevrons

Use for: linear processes, sales stages, implementation phases.

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center items-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <h2 className="text-[2.5rem] font-bold mb-14">Sales process</h2>
    <div className="flex items-center">
      {['Prospect', 'Qualify', 'Demo', 'Proposal', 'Close'].map((stage, i) => (
        <div key={stage} data-step="" className="step-fade flex items-center">
          <div className="relative px-8 py-4 text-center"
            style={{
              background: i === 0 ? 'var(--color-accent)' : 'var(--color-surface)',
              clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 50%, calc(100% - 16px) 100%, 0 100%, 16px 50%)',
              marginLeft: i === 0 ? 0 : -8,
              color: i === 0 ? 'var(--color-primary)' : 'var(--color-text)',
            }}>
            <p className="text-sm font-semibold">{stage}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

The first chevron is accent-colored (current stage). The rest are surface-colored. Use `clipPath: polygon()` to create the arrow shape.

## Pyramid / hierarchy

Use for: Maslow-style hierarchies, market tiers, brand pyramid.

```tsx
<div className="flex flex-col items-center gap-1">
  {[
    { label: 'Enterprise', width: '30%' },
    { label: 'Mid-market', width: '50%' },
    { label: 'SMB', width: '70%' },
    { label: 'Self-serve', width: '90%' },
  ].map((tier, i) => (
    <div key={tier.label} data-step="" className="step-fade text-center py-3 rounded-lg"
      style={{
        width: tier.width,
        background: `rgba(245,158,11,${0.3 - i * 0.06})`,
        border: '1px solid var(--color-border)',
      }}>
      <p className="text-sm font-semibold">{tier.label}</p>
    </div>
  ))}
</div>
```

### Pyramid rules

- 3-5 levels. More becomes illegible.
- Narrowest at top (highest value / smallest segment).
- Each level is a percentage width of its parent container.
- Use decreasing accent opacity from top (strongest) to bottom (lightest).

## Competitive positioning map

Use for: market positioning, competitive landscape, portfolio analysis.

This is a scatter plot on two strategic axes. Use the Recharts ScatterChart from the data-visualization skill, with custom labels for each competitor:

```tsx
const competitors = [
  { name: 'Acme', x: 85, y: 90, size: 16 },
  { name: 'Competitor A', x: 60, y: 40, size: 10 },
  { name: 'Competitor B', x: 30, y: 70, size: 10 },
  { name: 'Legacy', x: 20, y: 20, size: 8 },
]
```

- X-axis: one strategic dimension (e.g., "Ease of use").
- Y-axis: another strategic dimension (e.g., "Enterprise readiness").
- Acme is the largest dot, in accent color.
- Competitors are smaller, muted.
- Label each dot with the company name.

## Risk matrix

Use for: risk assessment, compliance review, project planning.

A 5x5 or 3x3 grid with color-coded cells (green = low, yellow = medium, red = high).

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Risk</p>
    <h2 className="text-[2.5rem] font-bold mb-10">Risk assessment</h2>
    <div className="card-surface overflow-hidden" style={{ maxWidth: 600 }}>
      <div className="grid grid-cols-4 text-center text-xs">
        <div className="p-2" />
        <div className="p-2 font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Low impact</div>
        <div className="p-2 font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>Med impact</div>
        <div className="p-2 font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>High impact</div>
        {['High likelihood', 'Med likelihood', 'Low likelihood'].map((row) => (
          <React.Fragment key={row}>
            <div className="p-2 font-semibold text-right pr-3" style={{ color: 'var(--color-text-tertiary)' }}>{row}</div>
            {[
              row === 'High likelihood' ? ['#f59e0b', '#ef4444', '#ef4444'] :
              row === 'Med likelihood' ? ['#22c55e', '#f59e0b', '#ef4444'] :
              ['#22c55e', '#22c55e', '#f59e0b']
            ][0].map((color, i) => (
              <div key={i} className="p-3 m-0.5 rounded"
                style={{ background: color, opacity: 0.2 }} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
</section>
```

Place risk items as labels inside the relevant cells.

## Pros and cons

Use for: decision support, options analysis, trade-off visualization.

```tsx
<section data-slide="">
  <div className="grid grid-cols-2 gap-8 items-start w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <div>
      <p className="text-sm font-semibold mb-6" style={{ color: '#22c55e' }}>Pros</p>
      <ul className="space-y-3">
        {['5x faster deploys', 'Zero-config scaling', '10x cost reduction'].map((item) => (
          <li key={item} data-step="" className="step-fade flex items-start gap-3 text-base">
            <span style={{ color: '#22c55e' }}>+</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
    <div>
      <p className="text-sm font-semibold mb-6" style={{ color: '#ef4444' }}>Cons</p>
      <ul className="space-y-3">
        {['6-month migration', 'Team retraining', 'Vendor lock-in risk'].map((item) => (
          <li key={item} data-step="" className="step-fade flex items-start gap-3 text-base">
            <span style={{ color: '#ef4444' }}>-</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
</section>
```

## Maturity model

Use for: capability assessment, digital transformation stages, process maturity.

```tsx
<div className="flex items-end gap-2">
  {[
    { level: 1, label: 'Ad hoc', active: false },
    { level: 2, label: 'Defined', active: false },
    { level: 3, label: 'Managed', active: true },
    { level: 4, label: 'Measured', active: false },
    { level: 5, label: 'Optimized', active: false },
  ].map((stage) => (
    <div key={stage.level} data-step="" className="step-move-up flex-1 text-center">
      <div className="rounded-t-lg py-4"
        style={{
          height: 60 + stage.level * 30,
          background: stage.active ? 'var(--color-accent)' : 'var(--color-surface)',
          border: stage.active ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <p className="text-lg font-bold"
          style={{ color: stage.active ? 'var(--color-primary)' : 'var(--color-text-tertiary)' }}>
          {stage.level}
        </p>
      </div>
      <p className="mt-2 text-xs font-semibold"
        style={{ color: stage.active ? 'var(--color-accent)' : 'var(--color-text-tertiary)' }}>
        {stage.label}
      </p>
    </div>
  ))}
</div>
```

The active stage is highlighted in accent color. Bars increase in height left to right.

## Concentric circles

Use for: ecosystem layers, strategic fit, layers of value.

Same technique as TAM/SAM/SOM but with different labels. Use absolutely-positioned circles within a relative container. Reveal from outside in (largest first) using `data-step`.

## Framework selection guide

| Framework | Use when |
|---|---|
| SWOT | Situational analysis, strategic review, competitive assessment |
| 2x2 matrix | Prioritizing options on two dimensions |
| TAM/SAM/SOM | Market sizing for investor decks |
| Process chevrons | Showing a linear workflow or sales stages |
| Pyramid | Showing hierarchy, market tiers, or value layers |
| Positioning map | Competitive landscape on two strategic axes |
| Risk matrix | Risk assessment with likelihood and impact |
| Pros/cons | Decision support, trade-off analysis |
| Pricing comparison | Plan/tier selection (see advanced-layouts skill) |
| Maturity model | Capability assessment, readiness scoring |
| Concentric circles | Ecosystem layers, strategic fit rings |

## Common mistakes

- Filling every cell of a SWOT with 8+ items. Keep it to 3-4 per quadrant.
- Centering items in a 2x2 instead of positioning them meaningfully by their coordinates.
- Using raw numbers for TAM without showing the methodology or source.
- Making all process chevrons the same color. Highlight the current or focus stage.
- Not revealing framework elements progressively. A full SWOT shown at once overwhelms.
