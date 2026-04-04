---
name: data-visualization
description: Chart types, KPI cards, dashboard patterns, and data styling rules for slidenerds slides using Recharts
---

# Data visualization skill

Use this skill when a slide needs charts, graphs, KPI displays, or any quantitative data visualization. All patterns use Recharts (React charting library) with brand-aware styling.

## Recharts setup

Install Recharts in the deck project:

```bash
npm install recharts
```

Import components as needed:

```tsx
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart,
} from 'recharts'
```

## Global chart styling rules

Every chart on a slide must follow these rules for consistency and projection readability.

### Axes

```tsx
<XAxis
  dataKey="name"
  stroke="transparent"
  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: 'var(--font-heading)' }}
  tickLine={false}
  axisLine={false}
/>
<YAxis
  stroke="transparent"
  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }}
  tickLine={false}
  axisLine={false}
  width={50}
/>
```

- Remove axis lines and tick lines. They add noise.
- X-axis labels at 50% opacity. Y-axis labels at 35%.
- Use the heading font for x-axis labels (they are category names the audience reads).
- Set explicit `width` on YAxis to prevent layout shifts.

### Grid

```tsx
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
```

- Barely visible. 4% white opacity. The grid orients the eye without competing with data.
- Always dashed, never solid.

### Tooltip

```tsx
<Tooltip
  contentStyle={{
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 10,
  }}
  labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
  itemStyle={{ color: 'var(--color-accent)' }}
/>
```

### Container

Always wrap charts in a card surface and use `ResponsiveContainer`:

```tsx
<div className="card-surface p-8">
  <ResponsiveContainer width="100%" height={400}>
    {/* Chart */}
  </ResponsiveContainer>
</div>
```

- Fixed pixel height (300-420px). Never use `height="100%"` -- it breaks when the parent is hidden.
- Card surface provides visual containment and depth.

### Animation

```tsx
<Bar animationDuration={800} animationEasing="ease-out" />
```

- Duration: 600-800ms. Fast enough for presentation pacing, slow enough to be noticed.
- Easing: `ease-out` (decelerating). Never `linear`.
- Reveal the chart with `data-step` so the animation plays when the presenter advances.

### Color

- Primary data series: `var(--color-accent)` or the accent hex value.
- Secondary series: Use opacity variants (80%, 60%, 40%) of the accent.
- For multi-series charts, use the color-blind safe palette from the accessibility skill.
- Maximum 4 data series per chart. More is unreadable.

### Data point limits

| Chart type | Max data points | Why |
|---|---|---|
| Bar chart | 8-10 bars | Labels overlap beyond 10 |
| Line chart | 12-15 points | More becomes a dense mess |
| Pie / donut | 5-6 slices | Small slices are meaningless |
| Radar | 5-8 axes | More creates visual noise |
| Scatter | 20-30 points | More requires a dashboard, not a slide |

## Bar chart

Use for: comparisons across categories, revenue by quarter, feature usage.

### Vertical bar chart

```tsx
<ResponsiveContainer width="100%" height={400}>
  <BarChart data={data} barCategoryGap="20%">
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
    <XAxis dataKey="name" stroke="transparent"
      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }}
      tickLine={false} axisLine={false} />
    <YAxis stroke="transparent"
      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }}
      tickLine={false} axisLine={false} width={50} />
    <Tooltip contentStyle={{ background: '#222228', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }} />
    <Bar dataKey="value" fill="var(--color-accent)" radius={[6, 6, 0, 0]}
      animationDuration={800} />
  </BarChart>
</ResponsiveContainer>
```

- `radius={[6, 6, 0, 0]}` rounds top corners. Looks modern.
- `barCategoryGap="20%"` gives bars breathing room.

### Horizontal bar chart

Use for: rankings, survey results, comparisons where labels are long.

```tsx
<BarChart data={data} layout="vertical" barCategoryGap="25%">
  <XAxis type="number" stroke="transparent"
    tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }}
    tickLine={false} axisLine={false} />
  <YAxis type="category" dataKey="name" stroke="transparent"
    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 13 }}
    tickLine={false} axisLine={false} width={120} />
  <Bar dataKey="value" fill="var(--color-accent)" radius={[0, 6, 6, 0]}
    animationDuration={800} />
</BarChart>
```

### Stacked bar chart

Use for: composition breakdown (revenue by segment, traffic by source).

```tsx
<BarChart data={data}>
  {/* ... axes */}
  <Bar dataKey="segment1" stackId="a" fill="var(--color-accent)" />
  <Bar dataKey="segment2" stackId="a" fill="rgba(245,158,11,0.6)" />
  <Bar dataKey="segment3" stackId="a" fill="rgba(245,158,11,0.3)"
    radius={[6, 6, 0, 0]} />
</BarChart>
```

- Only the top bar gets `radius`. Lower bars have flat tops.
- Use opacity variants of the accent for segment colors.
- Max 3-4 segments. More is noise.

## Line chart

Use for: trends over time, growth trajectories, comparisons across time periods.

```tsx
<ResponsiveContainer width="100%" height={380}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
    <XAxis dataKey="month" stroke="transparent"
      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
      tickLine={false} axisLine={false} />
    <YAxis stroke="transparent"
      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }}
      tickLine={false} axisLine={false} width={50} />
    <Line type="monotone" dataKey="value" stroke="var(--color-accent)"
      strokeWidth={2.5} dot={{ fill: 'var(--color-accent)', r: 4, strokeWidth: 0 }}
      animationDuration={800} />
  </LineChart>
</ResponsiveContainer>
```

### Multi-line chart

```tsx
<Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2.5}
  dot={{ r: 3 }} />
<Line type="monotone" dataKey="costs" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5}
  dot={{ r: 2 }} strokeDasharray="5 5" />
```

- Primary metric: solid line, thick (2.5px), accent color, larger dots.
- Secondary metric: dashed line, thin (1.5px), muted color, smaller dots.
- Max 3 lines. Beyond that, use separate slides.

## Area chart

Use for: volume over time, emphasizing magnitude, cumulative data.

```tsx
<AreaChart data={data}>
  <defs>
    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.25} />
      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
  {/* ... axes */}
  <Area type="monotone" dataKey="users" stroke="var(--color-accent)"
    strokeWidth={2.5} fill="url(#areaGrad)" animationDuration={800}
    dot={{ fill: 'var(--color-accent)', r: 4, strokeWidth: 0 }} />
</AreaChart>
```

- Always use a gradient fill (accent color fading to transparent).
- The gradient creates visual weight that says "this is growing."

## Pie / donut chart

Use for: market share, budget allocation, composition at a point in time.

```tsx
const COLORS = ['#f59e0b', 'rgba(245,158,11,0.6)', 'rgba(245,158,11,0.35)', 'rgba(255,255,255,0.15)']

<ResponsiveContainer width="100%" height={350}>
  <PieChart>
    <Pie data={data} dataKey="value" nameKey="name"
      cx="50%" cy="50%" innerRadius={80} outerRadius={130}
      paddingAngle={2} animationDuration={800}>
      {data.map((_, i) => (
        <Cell key={i} fill={COLORS[i % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip contentStyle={{ background: '#222228', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }} />
  </PieChart>
</ResponsiveContainer>
```

- Use donut (with `innerRadius`) rather than full pie. Donuts look more modern and leave space for a central label.
- Max 5-6 slices. Group small slices into "Other."
- `paddingAngle={2}` adds visual separation between slices.

### Central label for donut

```tsx
<text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle"
  fill="var(--color-text)" fontSize={28} fontWeight={700}>
  100%
</text>
<text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle"
  fill="rgba(255,255,255,0.4)" fontSize={12}>
  Total allocation
</text>
```

## Radar / spider chart

Use for: multi-dimensional comparison, team assessment, product scoring.

```tsx
<ResponsiveContainer width="100%" height={350}>
  <RadarChart data={data}>
    <PolarGrid stroke="rgba(255,255,255,0.08)" />
    <PolarAngleAxis dataKey="axis"
      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
    <Radar dataKey="score" stroke="var(--color-accent)" strokeWidth={2}
      fill="var(--color-accent)" fillOpacity={0.15} animationDuration={800} />
  </RadarChart>
</ResponsiveContainer>
```

- 5-8 axes maximum. Fewer looks sparse. More creates visual noise.
- Use `fillOpacity={0.15}` for a subtle area fill.

## Scatter / bubble chart

Use for: correlation analysis, competitive positioning, portfolio mapping.

```tsx
<ResponsiveContainer width="100%" height={400}>
  <ScatterChart>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
    <XAxis dataKey="x" name="Revenue" stroke="transparent"
      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
      tickLine={false} axisLine={false} />
    <YAxis dataKey="y" name="Growth" stroke="transparent"
      tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 12 }}
      tickLine={false} axisLine={false} />
    <Scatter data={data} fill="var(--color-accent)" animationDuration={800}>
      {data.map((entry, i) => (
        <Cell key={i} r={entry.size || 8} />
      ))}
    </Scatter>
  </ScatterChart>
</ResponsiveContainer>
```

For bubble charts, vary the `r` (radius) prop on each `Cell` based on a third data dimension.

## Combo chart (bar + line)

Use for: revenue bars with margin line, volume with average overlay.

```tsx
<ResponsiveContainer width="100%" height={400}>
  <ComposedChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
    {/* ... axes */}
    <Bar dataKey="revenue" fill="var(--color-accent)" radius={[6, 6, 0, 0]}
      animationDuration={800} />
    <Line type="monotone" dataKey="margin" stroke="rgba(255,255,255,0.6)"
      strokeWidth={2} dot={{ r: 3, fill: 'rgba(255,255,255,0.6)' }}
      strokeDasharray="5 5" />
  </ComposedChart>
</ResponsiveContainer>
```

- Bar is the primary metric (solid, accent color).
- Line is the secondary metric (dashed, muted color).
- Requires a second Y-axis if scales differ: `<YAxis yAxisId="right" orientation="right" />`.

## Waterfall chart

Use for: revenue bridges, P&L walks, budget variance analysis.

Recharts does not have a native waterfall component. Build with calculated offsets:

```tsx
const waterfallData = [
  { name: 'Q4 Revenue', value: 3100, isTotal: false },
  { name: 'New customers', value: 800, isTotal: false },
  { name: 'Expansion', value: 450, isTotal: false },
  { name: 'Churn', value: -350, isTotal: false },
  { name: 'Q1 Revenue', value: 4000, isTotal: true },
]

// Calculate offsets for stacking
const processedData = waterfallData.reduce((acc, item, i) => {
  if (item.isTotal) {
    acc.push({ ...item, offset: 0, fill: 'var(--color-accent)' })
  } else if (i === 0) {
    acc.push({ ...item, offset: 0, fill: 'var(--color-accent)' })
  } else {
    const prevTop = acc[i - 1].offset + Math.abs(acc[i - 1].value)
    const offset = item.value >= 0 ? prevTop : prevTop - Math.abs(item.value)
    acc.push({
      ...item,
      offset: item.value >= 0 ? prevTop : offset,
      fill: item.value >= 0 ? '#22c55e' : '#ef4444',
    })
  }
  return acc
}, [] as Array<typeof waterfallData[0] & { offset: number; fill: string }>)
```

Use stacked bars: an invisible "offset" bar + the visible "value" bar:

```tsx
<BarChart data={processedData}>
  <Bar dataKey="offset" stackId="a" fill="transparent" />
  <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]}>
    {processedData.map((entry, i) => (
      <Cell key={i} fill={entry.fill} />
    ))}
  </Bar>
</BarChart>
```

## Funnel chart

Use for: sales pipeline, conversion rates, user activation funnel.

Recharts does not have a native funnel. Build with CSS trapezoids:

```tsx
<div className="flex flex-col items-center gap-1" style={{ maxWidth: 500 }}>
  {[
    { label: 'Visitors', value: '10,000', width: '100%' },
    { label: 'Signups', value: '2,400', width: '75%' },
    { label: 'Activated', value: '1,100', width: '50%' },
    { label: 'Paid', value: '420', width: '30%' },
  ].map((stage, i) => (
    <div key={stage.label} data-step="" className="step-fade text-center"
      style={{ width: stage.width }}>
      <div className="py-3 rounded-lg flex items-center justify-between px-6"
        style={{
          background: `rgba(245,158,11,${0.4 - i * 0.08})`,
          border: '1px solid var(--color-accent)',
          borderColor: `rgba(245,158,11,${0.6 - i * 0.1})`,
        }}>
        <span className="text-sm font-semibold">{stage.label}</span>
        <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>{stage.value}</span>
      </div>
    </div>
  ))}
</div>
```

## Gauge / radial progress

Use for: NPS scores, completion percentages, health indicators.

Build with custom SVG:

```tsx
const GaugeChart: React.FC<{ value: number; max: number; label: string }> = ({ value, max, label }) => {
  const pct = value / max
  const circumference = Math.PI * 80 // half-circle, radius 80
  const offset = circumference * (1 - pct)

  return (
    <svg width={200} height={120} viewBox="0 0 200 120">
      {/* Background arc */}
      <path d="M 20,100 A 80,80 0 0,1 180,100"
        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={12} strokeLinecap="round" />
      {/* Value arc */}
      <path d="M 20,100 A 80,80 0 0,1 180,100"
        fill="none" stroke="var(--color-accent)" strokeWidth={12} strokeLinecap="round"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 800ms ease-out' }} />
      {/* Value text */}
      <text x="100" y="85" textAnchor="middle" fill="var(--color-text)"
        fontSize={28} fontWeight={700}>{value}</text>
      <text x="100" y="105" textAnchor="middle" fill="rgba(255,255,255,0.4)"
        fontSize={11}>{label}</text>
    </svg>
  )
}
```

## KPI card with sparkline

Use for: dashboard slides where each metric needs a trend indicator.

```tsx
<div className="card-surface p-5 flex items-end justify-between">
  <div>
    <p className="text-xs font-semibold tracking-[0.15em] uppercase"
      style={{ color: 'var(--color-text-tertiary)' }}>Revenue</p>
    <p className="text-3xl font-bold mt-2"
      style={{ fontFamily: 'var(--font-heading)' }}>$4.2M</p>
    <p className="text-sm mt-1" style={{ color: '#22c55e' }}>+142% YoY</p>
  </div>
  <ResponsiveContainer width={80} height={40}>
    <LineChart data={sparkData}>
      <Line type="monotone" dataKey="v" stroke="var(--color-accent)"
        strokeWidth={1.5} dot={false} />
    </LineChart>
  </ResponsiveContainer>
</div>
```

- Sparkline has no axes, no grid, no tooltip. Just the line.
- Width: 60-100px. Height: 30-50px.
- The sparkline shows direction, not values. The number beside it shows the value.

## Chart selection guide

| Question to answer | Chart type | Why |
|---|---|---|
| How does X compare across categories? | Bar chart (vertical) | Direct comparison |
| How does X rank? | Bar chart (horizontal) | Long labels fit better |
| What is the trend over time? | Line chart | Shows direction and velocity |
| What is the volume over time? | Area chart | Emphasizes magnitude |
| What is the composition? | Pie/donut or stacked bar | Shows parts of a whole |
| How do two metrics correlate? | Scatter chart | Shows relationship |
| How does X score across dimensions? | Radar chart | Multi-axis comparison |
| What are the revenue drivers? | Waterfall chart | Shows additive/subtractive components |
| What is the conversion rate? | Funnel chart | Shows progressive narrowing |
| What is the health score? | Gauge chart | Single metric with context |
| What is the trend direction? | Sparkline (in KPI card) | Inline trend indicator |
| Bar + line overlay? | Combo chart | Two metrics, different scales |

## Annotation patterns

### Callout annotation

Add a text annotation next to a specific data point:

```tsx
<text x={dataPointX} y={dataPointY - 15}
  fill="var(--color-accent)" fontSize={12} fontWeight={600}
  textAnchor="middle">Peak: $4.2M</text>
```

### Trend line / target line

Add a horizontal reference line:

```tsx
import { ReferenceLine } from 'recharts'

<ReferenceLine y={3000} stroke="rgba(255,255,255,0.2)"
  strokeDasharray="5 5" label={{
    value: 'Target',
    fill: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    position: 'right',
  }} />
```

## What to avoid

- More than one chart per slide (except dashboard slides).
- Pie charts for more than 6 categories.
- 3D effects on any chart. They distort data.
- Legend below the chart when labels on the chart itself would work.
- `height="100%"` on ResponsiveContainer. Use fixed pixel heights.
- Animating charts that are already visible. Only animate on reveal via `data-step`.
