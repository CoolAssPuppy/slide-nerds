---
name: diagrams
description: Diagram patterns for slidenerds slides using Mermaid, custom SVG, and HTML/CSS
---

# Diagrams skill

Use this skill when a slide needs a diagram, flowchart, org chart, journey map, or any structural visualization. Every pattern here produces a slide-ready result using Mermaid syntax or HTML/CSS.

## Rendering Mermaid diagrams

Mermaid diagrams render client-side. Wrap the chart string in a component that calls `mermaid.render()`. Install `mermaid` as a dependency. Use a ref-based approach with safe DOM manipulation rather than raw HTML insertion. Sanitize Mermaid SVG output with DOMPurify before inserting into the DOM.

```tsx
'use client'

import { useEffect, useRef, useId } from 'react'
import mermaid from 'mermaid'
import DOMPurify from 'dompurify'

type MermaidDiagramProps = {
  chart: string
  className?: string
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: 'var(--color-surface)',
    primaryTextColor: 'var(--color-text)',
    primaryBorderColor: 'var(--color-accent)',
    lineColor: 'var(--color-accent)',
    secondaryColor: 'var(--color-surface-elevated)',
    tertiaryColor: 'var(--color-primary)',
  },
})

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart, className }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const id = useId().replace(/:/g, '_')

  useEffect(() => {
    const render = async () => {
      if (!containerRef.current) return
      const { svg } = await mermaid.render(`mermaid-${id}`, chart)
      const sanitized = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } })
      containerRef.current.replaceChildren()
      const template = document.createElement('template')
      template.innerHTML = sanitized
      if (template.content.firstChild) {
        containerRef.current.appendChild(template.content.firstChild)
      }
    }
    render()
  }, [chart, id])

  return <div ref={containerRef} className={className} />
}
```

## Flowchart (process flow)

Use for: approval workflows, decision logic, system processes, user flows.

### Linear process (left to right)

```
graph LR
  A[Request submitted] --> B[Manager review]
  B --> C{Approved?}
  C -->|Yes| D[Process payment]
  C -->|No| E[Return to requester]
  D --> F[Complete]
```

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Process</p>
    <h2 className="text-[2.5rem] font-bold mb-12">Approval workflow</h2>
    <div data-step="" className="step-fade">
      <MermaidDiagram chart={`graph LR
        A[Request] --> B[Review]
        B --> C{Approved?}
        C -->|Yes| D[Process]
        C -->|No| E[Return]
        D --> F[Complete]
      `} />
    </div>
  </div>
</section>
```

### Vertical decision tree

```
graph TD
  A[Start] --> B{Condition 1}
  B -->|Yes| C[Action A]
  B -->|No| D{Condition 2}
  D -->|Yes| E[Action B]
  D -->|No| F[Action C]
```

### Flowchart styling rules for slides

- Max 8-10 nodes per diagram. More than that and the text becomes unreadable at projection distance.
- Use `graph LR` for processes with 4-6 sequential steps.
- Use `graph TD` for decision trees with branching logic.
- Decision nodes use `{}` diamond shape. Process nodes use `[]` rectangles.
- Keep node labels under 3 words.

## Org chart

Use for: company structure, reporting lines, team hierarchy.

Mermaid does not have a native org chart type. Use a top-down graph with specific styling.

```
graph TD
  CEO[CEO<br/>Alex Rivera] --> CTO[CTO<br/>Jordan Park]
  CEO --> CRO[CRO<br/>Sam Chen]
  CEO --> CFO[CFO<br/>Dana Lee]
  CTO --> ENG1[Engineering<br/>Team A]
  CTO --> ENG2[Engineering<br/>Team B]
  CRO --> SALES[Sales]
  CRO --> CS[Customer Success]
```

### HTML/CSS org chart (when Mermaid styling is insufficient)

For polished org charts, build with HTML/CSS:

```tsx
<section data-slide="">
  <div className="flex flex-col items-center justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <h2 className="text-[2.5rem] font-bold mb-12">Organization</h2>
    <div className="flex flex-col items-center gap-8">
      {/* Level 1 */}
      <div className="card-surface px-6 py-3 text-center">
        <p className="font-semibold">Alex Rivera</p>
        <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>CEO</p>
      </div>
      {/* Connector */}
      <div className="w-px h-6" style={{ background: 'var(--color-border)' }} />
      {/* Level 2 */}
      <div className="flex gap-16">
        <div className="flex flex-col items-center gap-2">
          <div className="card-surface px-5 py-2.5 text-center">
            <p className="font-semibold text-sm">Jordan Park</p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>CTO</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="card-surface px-5 py-2.5 text-center">
            <p className="font-semibold text-sm">Sam Chen</p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>CRO</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="card-surface px-5 py-2.5 text-center">
            <p className="font-semibold text-sm">Dana Lee</p>
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>CFO</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Sequence diagram

Use for: API flows, system interactions, user-service communication, authentication flows.

```
sequenceDiagram
  participant U as User
  participant A as API Gateway
  participant S as Auth Service
  participant D as Database

  U->>A: POST /login
  A->>S: Validate credentials
  S->>D: Query user
  D-->>S: User record
  S-->>A: JWT token
  A-->>U: 200 OK + token
```

### Sequence diagram rules for slides

- Max 4-5 participants (columns). More creates unreadable horizontal sprawl.
- Max 8-10 messages (rows). More becomes a spec document, not a slide.
- Use abbreviations for participant names.
- Group related messages with `rect` blocks for visual clarity.

## Journey map

Use for: customer experience, user onboarding, support workflow.

```
journey
  title Customer onboarding journey
  section Sign up
    Visit website: 5: Customer
    Create account: 4: Customer
    Verify email: 3: Customer
  section First use
    Complete tutorial: 4: Customer
    Import data: 2: Customer
    Invite team: 3: Customer
  section Activation
    First dashboard: 5: Customer
    Share report: 4: Customer
```

The numbers (1-5) represent satisfaction/sentiment. Higher is better.

### Journey map rules

- 3-4 sections maximum.
- 3-4 steps per section.
- The sentiment score drives the visual. Low scores (1-2) should be called out as pain points.

## State diagram

Use for: workflow states, order lifecycle, subscription status, feature flags.

```
stateDiagram-v2
  [*] --> Draft
  Draft --> Review : Submit
  Review --> Approved : Approve
  Review --> Draft : Reject
  Approved --> Published : Publish
  Published --> Archived : Archive
  Archived --> [*]
```

## Mind map

Use for: brainstorming output, feature mapping, topic exploration.

```
mindmap
  root((Product Strategy))
    Growth
      PLG funnel
      Sales-led
      Partnerships
    Retention
      Onboarding
      Feature adoption
      Support quality
    Expansion
      Upsell
      Cross-sell
      Enterprise tier
```

### Mind map rules

- One root node.
- 3-4 primary branches.
- 2-4 leaves per branch.
- More than 20 total nodes makes the diagram unreadable on a slide.

## Architecture diagram (C4 model)

Use for: system context, container view, component view.

Mermaid supports C4 diagrams:

```
C4Context
  title System Context Diagram

  Person(user, "User", "A customer of the system")
  System(app, "Acme Platform", "The main application")
  System_Ext(payment, "Stripe", "Payment processing")
  System_Ext(email, "SendGrid", "Email delivery")

  Rel(user, app, "Uses", "HTTPS")
  Rel(app, payment, "Processes payments", "API")
  Rel(app, email, "Sends emails", "API")
```

### Architecture diagram rules

- Context level: max 5-7 boxes. Show the system boundary clearly.
- Container level: max 8-10 boxes. Show databases, APIs, frontends.
- Component level: rarely appropriate for slides. Use for technical deep-dives only.

## Cycle / circular diagram

Use for: recurring processes, feedback loops, product lifecycle, flywheel.

Mermaid does not support circular layouts. Build with CSS:

```tsx
<section data-slide="">
  <div className="flex items-center justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <div className="relative" style={{ width: 400, height: 400 }}>
      {['Acquire', 'Activate', 'Retain', 'Expand'].map((label, i) => {
        const angle = (Math.PI * 2 * i) / 4 - Math.PI / 2
        const x = 200 + 150 * Math.cos(angle) - 50
        const y = 200 + 150 * Math.sin(angle) - 25
        return (
          <div key={label} data-step="" className="step-scale-in absolute"
            style={{ left: x, top: y, width: 100 }}>
            <SlideShape shape="circle" size={80}
              fill="var(--color-surface)" stroke="var(--color-accent)" strokeWidth={2}>
              <p className="text-xs font-semibold">{label}</p>
            </SlideShape>
          </div>
        )
      })}
    </div>
  </div>
</section>
```

## Venn diagram

Use for: overlap analysis, market positioning, skill intersection.

Build with custom SVG (overlapping circles with blend mode):

```tsx
<svg width={500} height={350} viewBox="0 0 500 350">
  <circle cx={190} cy={175} r={130} fill="var(--color-accent)" opacity={0.2}
    stroke="var(--color-accent)" strokeWidth={1.5} />
  <circle cx={310} cy={175} r={130} fill="var(--color-surface)" opacity={0.3}
    stroke="var(--color-border)" strokeWidth={1.5} />
  <text x={140} y={175} fill="var(--color-text)" fontSize={14}
    textAnchor="middle" dominantBaseline="middle">Engineering</text>
  <text x={360} y={175} fill="var(--color-text)" fontSize={14}
    textAnchor="middle" dominantBaseline="middle">Design</text>
  <text x={250} y={175} fill="var(--color-accent)" fontSize={12}
    textAnchor="middle" dominantBaseline="middle" fontWeight={600}>Product</text>
</svg>
```

## Swim lane diagram

Use for: cross-functional processes, showing ownership per team.

Build with CSS grid. Each row represents a team/department. Steps flow left to right within each lane.

```tsx
<div className="grid grid-cols-[120px_1fr] gap-0 card-surface overflow-hidden">
  <div className="p-3 font-semibold text-xs text-center"
    style={{ background: 'var(--color-surface-elevated)',
      borderBottom: '1px solid var(--color-border)' }}>
    Customer
  </div>
  <div className="p-3 flex gap-4 items-center"
    style={{ borderBottom: '1px solid var(--color-border)' }}>
    <SlideShape shape="rounded-square" width={100} height={40}
      fill="var(--color-accent-dim)" stroke="var(--color-accent)" strokeWidth={1}>
      <p className="text-[10px]">Submit request</p>
    </SlideShape>
  </div>
  {/* Additional lanes for Support, Engineering, etc. */}
</div>
```

## Diagram selection guide

| Need | Diagram type | Tool |
|---|---|---|
| Sequential process | Flowchart (LR) | Mermaid |
| Decision logic | Flowchart (TD) with diamonds | Mermaid |
| Company structure | Org chart | HTML/CSS or Mermaid graph TD |
| API / system interaction | Sequence diagram | Mermaid |
| User experience over time | Journey map | Mermaid |
| Lifecycle states | State diagram | Mermaid |
| Brainstorming / topic tree | Mind map | Mermaid |
| System architecture | C4 context/container | Mermaid |
| Recurring process | Cycle diagram | Custom SVG/CSS |
| Overlap / intersection | Venn diagram | Custom SVG |
| Cross-team process | Swim lane | CSS grid |

## Diagram quality rules

- Maximum complexity per slide: 10 nodes or 10 messages. Beyond that, split into multiple slides.
- Every node label must be readable at 18pt equivalent.
- Use the accent color for the primary flow path. Use muted colors for secondary paths.
- Reveal complex diagrams in steps using `data-step` to build understanding progressively.
- Always title the diagram slide with an action title that states the insight, not just the topic. "Data flows through three services before reaching the user" not "System architecture."
