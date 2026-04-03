---
name: advanced-layouts
description: Dashboard, comparison, logo wall, icon grid, before/after, agenda, and other composite slide layouts
---

# Advanced layouts skill

Use this skill for slides that combine multiple content types or need specialized arrangements beyond basic grids. Each pattern here is a complete slide recipe.

## Dashboard slide

Use for: board decks, QBRs, metrics reviews. Shows 4-6 KPIs on one slide.

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Performance</p>
    <h2 className="text-[2.5rem] font-bold mb-10">Q1 dashboard</h2>
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: 'ARR', value: '$4.2M', delta: '+142%', up: true },
        { label: 'MRR', value: '$350K', delta: '+12%', up: true },
        { label: 'Churn', value: '2.1%', delta: '-0.3%', up: false },
        { label: 'NPS', value: '72', delta: '+8', up: true },
        { label: 'CAC', value: '$148', delta: '-22%', up: false },
        { label: 'LTV:CAC', value: '5.2x', delta: '+0.8', up: true },
      ].map((metric) => (
        <div key={metric.label} data-step="" className="step-fade card-surface p-5">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase"
            style={{ color: 'var(--color-text-tertiary)' }}>{metric.label}</p>
          <p className="text-3xl font-bold mt-2"
            style={{ fontFamily: 'var(--font-heading)' }}>{metric.value}</p>
          <p className="text-sm mt-1"
            style={{ color: metric.up ? '#22c55e' : 'var(--color-accent)' }}>
            {metric.delta}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Dashboard rules

- 6 metrics maximum per slide. More is noise.
- Use a 3x2 or 2x3 grid. Never 1x6 or 6x1.
- Each card shows: label (small, uppercase, muted), value (large, bold), delta (small, colored green/red).
- All cards same height. Use `card-surface` for visual containment.
- Reveal cards progressively with `data-step` for presentation pacing.

## KPI card with sparkline

For dashboard slides that need trend context, pair the number with a tiny chart:

```tsx
<div className="card-surface p-5 flex items-end justify-between">
  <div>
    <p className="text-xs font-semibold tracking-[0.15em] uppercase"
      style={{ color: 'var(--color-text-tertiary)' }}>Revenue</p>
    <p className="text-3xl font-bold mt-2">$4.2M</p>
    <p className="text-sm mt-1" style={{ color: '#22c55e' }}>+142%</p>
  </div>
  <ResponsiveContainer width={80} height={40}>
    <LineChart data={sparkData}>
      <Line type="monotone" dataKey="v" stroke="var(--color-accent)"
        strokeWidth={1.5} dot={false} />
    </LineChart>
  </ResponsiveContainer>
</div>
```

## Three-option comparison

Use for: pricing tiers, plan selection, product editions. The center option is visually highlighted.

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center items-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <h2 className="text-[2.5rem] font-bold mb-12">Pricing</h2>
    <div className="grid grid-cols-3 gap-6" style={{ maxWidth: 900 }}>
      {[
        { name: 'Starter', price: '$29', features: ['5 users', '10GB storage', 'Email support'], highlighted: false },
        { name: 'Pro', price: '$99', features: ['25 users', '100GB storage', 'Priority support', 'API access'], highlighted: true },
        { name: 'Enterprise', price: 'Custom', features: ['Unlimited users', '1TB storage', 'Dedicated support', 'SSO', 'SLA'], highlighted: false },
      ].map((tier) => (
        <div key={tier.name} data-step="" className="step-move-up"
          style={{
            background: tier.highlighted ? 'var(--color-surface)' : 'transparent',
            border: tier.highlighted ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
            borderRadius: 14,
            padding: '2rem',
            position: 'relative',
          }}>
          {tier.highlighted && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: 'var(--color-accent)', color: 'var(--color-primary)' }}>
              Most popular
            </span>
          )}
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-tertiary)' }}>{tier.name}</p>
          <p className="text-4xl font-bold mt-2" style={{ fontFamily: 'var(--font-heading)' }}>{tier.price}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>per month</p>
          <ul className="mt-6 space-y-2">
            {tier.features.map((f) => (
              <li key={f} className="text-sm flex items-center gap-2">
                <span style={{ color: 'var(--color-accent)' }}>&#10003;</span> {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Comparison rules

- Always highlight one option (usually the middle one).
- Use a "Most popular" or "Recommended" badge on the highlighted option.
- Features list grows top to bottom. Higher tiers include all lower-tier features.
- Use checkmarks or dots for feature lists, not bullets.

## Before / after split

Use for: transformations, product impact, process improvement.

```tsx
<section data-slide="">
  <div className="grid grid-cols-2 w-full min-h-screen">
    <div className="flex flex-col justify-center"
      style={{ padding: '4rem', background: 'var(--color-primary)' }}>
      <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
        style={{ color: 'var(--color-text-tertiary)' }}>Before</p>
      <h3 className="text-2xl font-bold mb-6">Manual deploys</h3>
      <ul className="space-y-3 text-base" style={{ color: 'var(--color-text-secondary)' }}>
        <li>2-4 week deployment cycles</li>
        <li>3 engineers on deploy duty</li>
        <li>Frequent rollbacks</li>
      </ul>
    </div>
    <div className="flex flex-col justify-center"
      style={{ padding: '4rem', background: 'var(--color-surface)' }}>
      <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
        style={{ color: 'var(--color-accent)' }}>After</p>
      <h3 className="text-2xl font-bold mb-6">Acme CI/CD</h3>
      <ul className="space-y-3 text-base">
        <li>5-minute deploys</li>
        <li>Zero deploy duty</li>
        <li>Automatic canary releases</li>
      </ul>
    </div>
  </div>
</section>
```

### Before/after rules

- Use a clear visual divider (background color change or vertical line).
- "Before" is muted (darker background, secondary text color).
- "After" is brighter (surface background, primary text, accent label).
- Keep content parallel (same number of points on each side).

## Icon + text grid

Use for: features, benefits, capabilities, service offerings.

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Platform</p>
    <h2 className="text-[2.5rem] font-bold mb-12">Key capabilities</h2>
    <div className="grid grid-cols-3 gap-10">
      {[
        { icon: 'hexagon', label: 'Auto-scaling', desc: 'Scale from 0 to 10M requests with zero config' },
        { icon: 'diamond', label: 'Edge network', desc: '42 global regions, sub-20ms latency worldwide' },
        { icon: 'star', label: 'Security', desc: 'SOC 2 Type II, HIPAA, and GDPR compliant' },
        { icon: 'plus', label: 'Integrations', desc: '200+ native integrations with your existing stack' },
        { icon: 'circle', label: 'Observability', desc: 'Built-in metrics, logs, and distributed tracing' },
        { icon: 'rounded-square', label: 'Support', desc: '99.99% SLA with dedicated account management' },
      ].map((item) => (
        <div key={item.label} data-step="" className="step-move-up flex gap-4">
          <SlideShape shape={item.icon as any} size={48}
            fill="var(--color-accent-dim)" stroke="var(--color-accent)" strokeWidth={1} />
          <div>
            <p className="font-semibold text-sm">{item.label}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Icon grid rules

- 6 items maximum (3x2 grid).
- Each item: shape icon + label + one-line description.
- Shape icons should use the accent color at low opacity for fill, accent for stroke.
- All items reveal progressively with `data-step`.

## Logo wall

Use for: customer logos, partner logos, technology stack, integration partners.

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center items-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Customers</p>
    <h2 className="text-[2.5rem] font-bold mb-14">Trusted by industry leaders</h2>
    <div className="grid grid-cols-4 gap-8 items-center justify-items-center"
      style={{ maxWidth: 800, opacity: 0.6 }}>
      {/* Replace with actual logo images */}
      {['TechCorp', 'DataFlow', 'CloudBase', 'NetScale',
        'AppForge', 'SyncLabs', 'DevStack', 'InfraHub'].map((name) => (
        <div key={name} className="card-surface px-6 py-4 text-center w-full">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{name}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Logo wall rules

- 8-12 logos maximum. More dilutes the signal.
- All logos same size container (use `w-full` within grid cells).
- Reduce opacity to 50-70% so logos don't compete with content.
- Use `filter: brightness(0) invert(1)` on dark backgrounds to convert colored logos to white.
- 4 columns for 8 logos, 5 columns for 10-15 logos.

## Numbered list with descriptions

Use for: pillars, principles, steps, priorities.

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Strategy</p>
    <h2 className="text-[2.5rem] font-bold mb-12">Three pillars</h2>
    <div className="space-y-8" style={{ maxWidth: 700 }}>
      {[
        { n: '01', title: 'Product-led growth', desc: 'Self-serve onboarding that converts without sales intervention.' },
        { n: '02', title: 'Enterprise expansion', desc: 'Land-and-expand motion targeting Fortune 500 accounts.' },
        { n: '03', title: 'Platform ecosystem', desc: 'Marketplace of integrations that increases switching costs.' },
      ].map((item) => (
        <div key={item.n} data-step="" className="step-move-up flex gap-6 items-start">
          <span className="text-3xl font-extrabold"
            style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-heading)', opacity: 0.3, minWidth: 60 }}>
            {item.n}
          </span>
          <div>
            <p className="text-lg font-semibold">{item.title}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

## Agenda / table of contents

Use for: opening of a long presentation, section navigation.

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <h2 className="text-[2.5rem] font-bold mb-14">Agenda</h2>
    <div className="space-y-4" style={{ maxWidth: 600 }}>
      {[
        { n: '01', title: 'Financial performance', time: '5 min' },
        { n: '02', title: 'Product update', time: '5 min' },
        { n: '03', title: 'Growth metrics', time: '5 min' },
        { n: '04', title: 'Roadmap', time: '3 min' },
        { n: '05', title: 'Discussion', time: '10 min' },
      ].map((item) => (
        <div key={item.n} data-step="" className="step-fade
          flex items-center justify-between py-3"
          style={{ borderBottom: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold"
              style={{ color: 'var(--color-accent)', minWidth: 30 }}>{item.n}</span>
            <span className="text-lg">{item.title}</span>
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>{item.time}</span>
        </div>
      ))}
    </div>
  </div>
</section>
```

## Photo grid / mosaic

Use for: culture slides, product screenshots, event photography.

```tsx
<section data-slide="">
  <div className="grid grid-cols-3 gap-1 w-full min-h-screen">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="relative overflow-hidden">
        <img src={`/photos/${i}.jpg`} alt=""
          className="w-full h-full object-cover" />
      </div>
    ))}
  </div>
</section>
```

### Photo grid rules

- 4-9 photos. More becomes chaotic.
- Use `gap-1` for tight mosaic or `gap-2` for breathing room.
- All images use `object-cover` for consistent sizing.
- No text overlays on photo grids (put the caption on a separate slide).

## Quote + supporting data

Use for: combining a testimonial with the data that backs it up.

```tsx
<section data-slide="">
  <div className="grid grid-cols-12 gap-8 items-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <div className="col-span-5">
      <div className="text-4xl mb-4" style={{ color: 'var(--color-accent)', opacity: 0.2 }}>&ldquo;</div>
      <blockquote className="text-xl font-light leading-relaxed"
        style={{ fontFamily: 'var(--font-heading)' }}>
        Deployment time dropped from weeks to minutes.
      </blockquote>
      <div className="mt-6">
        <p className="text-sm font-semibold">Sarah Chen</p>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>VP Eng, TechCorp</p>
      </div>
    </div>
    <div className="col-span-7">
      <div className="card-surface p-6">
        {/* Chart showing the improvement */}
      </div>
    </div>
  </div>
</section>
```

### Quote + data rules

- Asymmetric split: 5 columns for quote, 7 for data.
- Quote is text-only. Data side has a chart or stat in a card surface.
- The quote and data must tell the same story.

## Appendix slide

Use for: detailed reference data not meant for live presenting.

Appendix slides relax the normal density rules:
- Font floor drops to 14pt (from 16pt).
- Whitespace ratio drops to 30% (from 40-60%).
- Multiple charts or tables per slide are acceptable.
- Mark clearly with "Appendix" section label.

```tsx
<section data-slide="">
  <div className="flex flex-col w-full min-h-screen"
    style={{ padding: '2.5rem 4rem' }}>
    <div className="flex items-center justify-between mb-6">
      <div>
        <p className="section-label mb-1">Appendix</p>
        <h2 className="text-xl font-bold">Detailed financials</h2>
      </div>
      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>Reference only</p>
    </div>
    {/* Dense content: tables, charts, small text */}
  </div>
</section>
```

## Progress tracker

Use for: showing "you are here" in a multi-section presentation.

```tsx
<div className="flex items-center gap-2 mb-12">
  {['Financials', 'Product', 'Growth', 'Roadmap', 'Q&A'].map((section, i) => (
    <React.Fragment key={section}>
      {i > 0 && <div className="w-8 h-px" style={{ background: 'var(--color-border)' }} />}
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
        i === currentSection
          ? ''
          : ''
      }`}
        style={{
          background: i === currentSection ? 'var(--color-accent-dim)' : 'transparent',
          color: i === currentSection ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
        }}>
        {section}
      </span>
    </React.Fragment>
  ))}
</div>
```

## Layout selection guide

| Need | Layout | Key property |
|---|---|---|
| Multiple KPIs | Dashboard (3x2 grid) | `grid grid-cols-3` |
| Pricing / plan options | Three-option comparison | Center card highlighted |
| Transformation story | Before/after split | `grid grid-cols-2`, different backgrounds |
| Features / capabilities | Icon + text grid (3x2) | Shape icon + label + description |
| Social proof | Logo wall (4x2) | Reduced opacity, uniform sizing |
| Strategic priorities | Numbered list | Large faded number + text |
| Session overview | Agenda / TOC | Numbered rows with time |
| Culture / portfolio | Photo grid | `gap-1`, `object-cover` |
| Testimonial + proof | Quote + data (5:7) | Asymmetric columns |
| Reference material | Appendix | Relaxed density rules |
| Navigation aid | Progress tracker | Horizontal pill indicators |
