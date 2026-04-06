import Link from 'next/link'

type ReferenceContentProps = {
  variant?: 'marketing' | 'dashboard'
}

export function ReferenceContent({ variant = 'marketing' }: ReferenceContentProps) {
  const isDashboard = variant === 'dashboard'
  const backHref = isDashboard ? '/help' : '/docs'

  return (
    <div className={isDashboard ? '' : 'max-w-3xl mx-auto py-16 px-6'}>
      <div className="mb-4">
        <Link href={backHref} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          &larr; Back to docs
        </Link>
      </div>
      <h1 className={isDashboard ? 'text-2xl font-bold mb-2' : 'text-4xl font-extrabold tracking-tight'}>
        Slide definition language
      </h1>
      <p className={`${isDashboard ? 'mb-8' : 'mt-4'} text-sm text-[var(--muted-foreground)]`}>
        Every SlideNerds deck is a Next.js page. Slides are HTML sections with data attributes. No proprietary format, no DSL. Just React.
      </p>

      {/* Structure */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Structure</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          A deck is a single page component that returns sections. Each section with <Code>data-slide</Code> becomes a slide.
        </p>
        <CodeBlock code={`export default function Home() {
  return (
    <main>
      <section data-slide="">
        <h1>Title slide</h1>
      </section>

      <section data-slide="">
        <h2>Second slide</h2>
        <p>Content goes here</p>
      </section>
    </main>
  )
}`} />
      </section>

      {/* Data attributes */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Data attributes</h2>
        <Table
          headers={['Attribute', 'Element', 'Purpose']}
          rows={[
            [<Code key="1">data-slide</Code>, '<section>', 'Marks an element as a slide. Required on every slide.'],
            [<Code key="2">data-step</Code>, 'Any child', 'Progressive reveal. Hidden until the presenter advances. Use for bullet points, images, or any content.'],
            [<Code key="3">data-notes</Code>, 'Any child', 'Speaker notes. Hidden during presentation, visible in presenter mode (press P).'],
            [<Code key="4">data-magic-id</Code>, 'Any child', 'Shared identity for Magic Move. Elements with the same ID on consecutive slides animate between positions.'],
          ]}
        />
      </section>

      {/* Progressive reveal */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Progressive reveal (data-step)</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          Add <Code>data-step</Code> to any element to hide it until the presenter presses the right arrow or space. Steps reveal in DOM order. Pair with an animation class for visual effect.
        </p>
        <CodeBlock code={`<section data-slide="">
  <h2>Three reasons</h2>
  <ul>
    <li data-step="" className="step-fade">First reason</li>
    <li data-step="" className="step-fade">Second reason</li>
    <li data-step="" className="step-fade">Third reason</li>
  </ul>
</section>`} />
      </section>

      {/* Entrance animations */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Entrance animations (step-*)</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          Apply to <Code>data-step</Code> elements to control how they appear when revealed.
        </p>

        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mt-6 mb-3">Fades</h3>
        <Table headers={['Class', 'Effect']} rows={[
          ['step-fade', 'Opacity 0 to 1'],
          ['step-fade-slow', 'Slow fade in'],
          ['step-dissolve', 'Dissolve in'],
        ]} />

        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mt-6 mb-3">Slides and flies</h3>
        <Table headers={['Class', 'Effect']} rows={[
          ['step-move-up', 'Slide up + fade'],
          ['step-move-down', 'Slide down + fade'],
          ['step-move-left', 'Slide left + fade'],
          ['step-move-right', 'Slide right + fade'],
          ['step-fly-in-left', 'Fly in from far left'],
          ['step-fly-in-right', 'Fly in from far right'],
          ['step-fly-in-top', 'Fly in from top'],
          ['step-fly-in-bottom', 'Fly in from bottom'],
          ['step-float-up', 'Float up gently'],
          ['step-float-down', 'Float down gently'],
          ['step-slide-in-left', 'Slide in from left'],
          ['step-slide-in-right', 'Slide in from right'],
          ['step-glide-up', 'Glide up'],
          ['step-glide-down', 'Glide down'],
          ['step-peek-left', 'Peek in from left'],
          ['step-peek-right', 'Peek in from right'],
        ]} />

        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mt-6 mb-3">Scales and zooms</h3>
        <Table headers={['Class', 'Effect']} rows={[
          ['step-scale-in', 'Scale 0.92 to 1 + fade'],
          ['step-scale-up', 'Scale up from small'],
          ['step-scale-down', 'Scale down from large'],
          ['step-zoom-in', 'Zoom in from tiny'],
          ['step-zoom-in-rotate', 'Zoom in with rotation'],
          ['step-grow', 'Grow from nothing'],
        ]} />

        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mt-6 mb-3">Pops and bounces</h3>
        <Table headers={['Class', 'Effect']} rows={[
          ['step-pop', 'Scale pop with spring overshoot'],
          ['step-bounce', 'Bounce in'],
          ['step-bounce-left', 'Bounce in from left'],
          ['step-bounce-right', 'Bounce in from right'],
          ['step-elastic', 'Elastic spring entrance'],
          ['step-drop', 'Drop in from above'],
          ['step-rise', 'Rise up from below'],
          ['step-swing-in', 'Swing in with rotation'],
        ]} />

        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mt-6 mb-3">Spins and flips</h3>
        <Table headers={['Class', 'Effect']} rows={[
          ['step-spin-in', 'Spin in with rotation'],
          ['step-spin-in-slow', 'Slow spin in'],
          ['step-flip-x', 'Flip on X axis'],
          ['step-flip-y', 'Flip on Y axis'],
          ['step-rotate-in', 'Rotate in from angle'],
        ]} />

        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mt-6 mb-3">Wipes and reveals</h3>
        <Table headers={['Class', 'Effect']} rows={[
          ['step-wipe-right', 'Clip-path wipe right'],
          ['step-wipe-left', 'Clip-path wipe left'],
          ['step-wipe-up', 'Clip-path wipe up'],
          ['step-wipe-down', 'Clip-path wipe down'],
          ['step-iris', 'Iris circle reveal'],
          ['step-diamond-reveal', 'Diamond shape reveal'],
          ['step-split-horizontal', 'Split open horizontally'],
          ['step-split-vertical', 'Split open vertically'],
        ]} />

        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mt-6 mb-3">Filters</h3>
        <Table headers={['Class', 'Effect']} rows={[
          ['step-blur-in', 'Blur to sharp'],
          ['step-unblur', 'Unblur reveal'],
          ['step-brightness', 'Brighten in'],
          ['step-saturate', 'Saturate colors in'],
        ]} />

        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mt-6 mb-3">Text</h3>
        <Table headers={['Class', 'Effect']} rows={[
          ['step-typewriter', 'Typewriter character reveal'],
          ['step-text-reveal', 'Text clip reveal'],
          ['step-letter-spread', 'Letters spread from center'],
        ]} />
      </section>

      {/* Exit animations */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Exit animations (exit-*)</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          Apply to <Code>data-exit-step</Code> elements. They animate out before the slide transitions.
        </p>
        <Table headers={['Class', 'Effect']} rows={[
          ['exit-fade', 'Fade out'],
          ['exit-move-up', 'Slide up + fade out'],
          ['exit-move-down', 'Slide down + fade out'],
          ['exit-move-left', 'Slide left + fade out'],
          ['exit-move-right', 'Slide right + fade out'],
          ['exit-fly-out-left', 'Fly out to far left'],
          ['exit-fly-out-right', 'Fly out to far right'],
          ['exit-fly-out-top', 'Fly out to top'],
          ['exit-fly-out-bottom', 'Fly out to bottom'],
          ['exit-scale-down', 'Scale down + fade out'],
          ['exit-scale-up', 'Scale up + fade out'],
          ['exit-zoom-out', 'Zoom out to nothing'],
          ['exit-spin-out', 'Spin out with rotation'],
          ['exit-flip-x', 'Flip away on X axis'],
          ['exit-flip-y', 'Flip away on Y axis'],
          ['exit-wipe-left', 'Wipe away left'],
          ['exit-wipe-right', 'Wipe away right'],
          ['exit-wipe-up', 'Wipe away up'],
          ['exit-wipe-down', 'Wipe away down'],
          ['exit-iris', 'Iris circle close'],
          ['exit-blur', 'Blur out'],
          ['exit-drop-off', 'Drop off screen'],
          ['exit-bounce-off', 'Bounce off screen'],
          ['exit-pop', 'Pop away'],
          ['exit-shrink-rotate', 'Shrink and rotate away'],
          ['exit-dissolve', 'Dissolve out'],
        ]} />
      </section>

      {/* Emphasis animations */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Emphasis animations (emphasis-*)</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          Apply to <Code>data-step</Code> elements. Triggered on second click to draw attention to a visible element.
        </p>
        <Table headers={['Class', 'Effect']} rows={[
          ['emphasis-pulse', 'Scale pulse'],
          ['emphasis-bounce', 'Bounce in place'],
          ['emphasis-shake', 'Horizontal shake'],
          ['emphasis-wobble', 'Wobble rotation'],
          ['emphasis-jiggle', 'Quick jiggle'],
          ['emphasis-rubber-band', 'Rubber band stretch'],
          ['emphasis-swing', 'Pendulum swing'],
          ['emphasis-tada', 'Attention-getting tada'],
          ['emphasis-heartbeat', 'Heartbeat pulse'],
          ['emphasis-flash', 'Flash opacity'],
          ['emphasis-spin', 'Full spin'],
          ['emphasis-float', 'Float up and down'],
          ['emphasis-glow', 'Glow effect'],
          ['emphasis-color-pulse', 'Color shift pulse'],
          ['emphasis-teeter', 'Teeter back and forth'],
          ['emphasis-flicker', 'Quick flicker'],
          ['emphasis-grow', 'Grow slightly'],
          ['emphasis-shrink', 'Shrink slightly'],
        ]} />
      </section>

      {/* Auto-build animations */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Auto-build animations (auto-*)</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          Animate elements automatically when a slide becomes active. No <Code>data-step</Code> needed. Stagger with <Code>animationDelay</Code>.
        </p>
        <Table headers={['Class', 'Effect']} rows={[
          ['auto-fade', 'Fade in on slide enter'],
          ['auto-slide-up', 'Slide up + fade'],
          ['auto-slide-down', 'Slide down + fade'],
          ['auto-slide-left', 'Slide left + fade'],
          ['auto-slide-right', 'Slide right + fade'],
          ['auto-pop', 'Scale pop'],
          ['auto-scale-in', 'Scale in'],
          ['auto-zoom-in', 'Zoom in'],
          ['auto-wipe-right', 'Wipe right'],
          ['auto-wipe-left', 'Wipe left'],
          ['auto-blur-in', 'Blur to sharp'],
          ['auto-fly-in-left', 'Fly in from left'],
          ['auto-fly-in-right', 'Fly in from right'],
          ['auto-bounce', 'Bounce in'],
          ['auto-spin-in', 'Spin in'],
          ['auto-flip-x', 'Flip on X axis'],
        ]} />
        <CodeBlock code={`<section data-slide="">
  <h2>Our team</h2>
  <div className="auto-fade" style={{ animationDelay: '0.2s' }}>
    Card 1
  </div>
  <div className="auto-fade" style={{ animationDelay: '0.4s' }}>
    Card 2
  </div>
</section>`} />
      </section>

      {/* Slide transitions */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Slide transitions (data-transition)</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          Set the <Code>data-transition</Code> attribute on a slide to control how it transitions to/from the next slide.
        </p>
        <Table headers={['Value', 'Effect']} rows={[
          ['fade', 'Cross-fade (default)'],
          ['dissolve', 'Dissolve blend'],
          ['push-left', 'Push left'],
          ['push-right', 'Push right'],
          ['push-up', 'Push up'],
          ['push-down', 'Push down'],
          ['slide-left', 'Slide left'],
          ['slide-right', 'Slide right'],
          ['cover-left', 'Cover from right'],
          ['cover-right', 'Cover from left'],
          ['cover-up', 'Cover from bottom'],
          ['cover-down', 'Cover from top'],
          ['uncover-left', 'Uncover to left'],
          ['uncover-right', 'Uncover to right'],
          ['uncover-up', 'Uncover to top'],
          ['uncover-down', 'Uncover to bottom'],
          ['zoom-in', 'Zoom in'],
          ['zoom-out', 'Zoom out'],
          ['flip-x', '3D flip on X axis'],
          ['flip-y', '3D flip on Y axis'],
          ['cube-left', '3D cube rotate left'],
          ['cube-right', '3D cube rotate right'],
          ['iris', 'Iris circle reveal'],
          ['split-horizontal', 'Split open horizontally'],
          ['split-vertical', 'Split open vertically'],
          ['morph', 'Morph blend'],
        ]} />
        <CodeBlock code={`<section data-slide="" data-transition="cube-left">
  <h1>This slide uses a 3D cube transition</h1>
</section>`} />
      </section>

      {/* Magic Move */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Magic Move</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          Give elements the same <Code>data-magic-id</Code> on consecutive slides. The runtime animates position and scale between them automatically.
        </p>
        <CodeBlock code={`{/* Slide 1: revenue number is large and centered */}
<section data-slide="">
  <div data-magic-id="revenue" className="text-6xl font-bold">
    $4.2M
  </div>
</section>

{/* Slide 2: same element, now small and top-left */}
<section data-slide="">
  <div data-magic-id="revenue" className="text-xl">
    $4.2M
  </div>
  <p>Here is how we got there.</p>
</section>`} />
      </section>

      {/* Speaker notes */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Speaker notes</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          Add <Code>data-notes</Code> to any element inside a slide. The content is hidden during presentation and shown in the presenter view (press P).
        </p>
        <CodeBlock code={`<section data-slide="">
  <h2>Revenue growth</h2>
  <p>Up 18% quarter over quarter</p>
  <div data-notes="">
    Mention the enterprise deal pipeline.
    Ask if anyone has questions about methodology.
  </div>
</section>`} />
      </section>

      {/* Brand config */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Brand configuration</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          The <Code>brand.config.ts</Code> file at the root of your project defines colors, fonts, and spacing. The layout injects these as CSS custom properties. One file change rebrands the entire deck.
        </p>
        <CodeBlock code={`// brand.config.ts
export default {
  colors: {
    primary: '#0d0d0f',     // Section dividers, dark surfaces
    accent: '#f59e0b',      // Highlights, stats, chart fills
    background: '#111114',  // Slide canvas
    surface: '#1a1a1f',     // Card backgrounds
    text: '#e8e6e3',        // Body text and headings
  },
  fonts: {
    heading: '"Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  spacing: {
    slide: '5rem',     // Outer slide padding
    section: '2rem',   // Gap between sections
    element: '1rem',   // Gap between elements
  },
}`} />
        <Table
          headers={['CSS variable', 'Source', 'Usage']}
          rows={[
            ['--color-primary', 'colors.primary', 'Section dividers, darkest surfaces'],
            ['--color-accent', 'colors.accent', 'Highlights, stats, shape strokes, chart fills'],
            ['--color-background', 'colors.background', 'Slide canvas background'],
            ['--color-surface', 'colors.surface', 'Card backgrounds'],
            ['--color-text', 'colors.text', 'Primary text color'],
            ['--slide-padding', 'spacing.slide', 'Outer slide padding'],
            ['--font-heading', 'fonts.heading', 'Heading font stack'],
            ['--font-body', 'fonts.body', 'Body text font stack'],
            ['--font-mono', 'fonts.mono', 'Monospace font stack'],
          ]}
        />
      </section>

      {/* Utility classes */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Utility classes</h2>
        <Table
          headers={['Class', 'Purpose']}
          rows={[
            ['section-label', 'Small uppercase accent-colored label above a heading'],
            ['card-surface', 'Rounded container with surface background and border'],
            ['accent-line', '40x3px decorative accent line'],
            ['stat-glow', 'Text shadow glow for large numbers'],
            ['bg-mesh-warm', 'Subtle warm radial gradient background'],
            ['bg-mesh-cool', 'Subtle cool radial gradient background'],
            ['bg-section', 'Linear gradient for section dividers'],
            ['slide-table', 'Table with uppercase headers and border styling'],
            ['timeline-track', 'Horizontal connector line for timelines'],
            ['timeline-dot', 'Accent circle with glow for timeline nodes'],
            ['sr-only', 'Visually hidden, accessible to screen readers'],
          ]}
        />
      </section>

      {/* Keyboard controls */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Keyboard controls</h2>
        <Table
          headers={['Key', 'Action']}
          rows={[
            ['Space / Right arrow', 'Next step or slide'],
            ['Left arrow / Backspace', 'Previous step or slide'],
            ['P', 'Presenter mode (notes + timer)'],
            ['L', 'Light Table (slide overview)'],
            ['F', 'Fullscreen'],
            ['?', 'Show keyboard shortcuts'],
            ['Escape', 'Exit Light Table or fullscreen'],
          ]}
        />
      </section>

      {/* Shapes */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Shape system</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          18 SVG shapes available via the <Code>SlideShape</Code> component.
        </p>
        <CodeBlock code={`import { SlideShape } from '@strategicnerds/slide-nerds'

<SlideShape
  shape="hexagon"
  size={120}
  fill="var(--color-surface)"
  stroke="var(--color-accent)"
  strokeWidth={1.5}
>
  <p>Label</p>
</SlideShape>`} />
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Available shapes: circle, square, rounded-square, triangle, diamond, pentagon, hexagon, octagon, star, plus, cloud, arrow-right, arrow-left, chevron-right, pill.
        </p>
      </section>

      {/* Embedding components */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Embedding React components</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          Slides are React components. Import and render anything -- charts, interactive demos, live data.
        </p>
        <CodeBlock code={`import { PricingCalculator } from '../components/PricingCalculator'

<section data-slide="">
  <h2>Interactive demo</h2>
  <PricingCalculator initialPlan="pro" />
  <div data-notes="">
    Let the audience interact with the calculator.
    Switch to cached data if the API is down.
  </div>
</section>`} />
      </section>

      {/* Live components */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Live components</h2>
        <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
          Five components for real-time audience interaction. Require a hosted deck on slidenerds.com with an active live session.
        </p>
        <CodeBlock code={`import {
  LivePoll,
  LiveReactions,
  LiveQA,
  LiveAudienceCount,
  LiveWordCloud,
} from '@strategicnerds/slide-nerds'

<section data-slide="">
  <LivePoll
    question="What matters most?"
    options={['Speed', 'Reliability', 'Cost']}
  />
</section>

<section data-slide="">
  <LiveQA />
  <LiveReactions />
</section>

<section data-slide="">
  <LiveWordCloud prompt="One word for your experience" />
  <LiveAudienceCount />
</section>`} />
      </section>
    </div>
  )
}

function Code({ children }: { children: string }) {
  return (
    <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded font-mono">
      {children}
    </code>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="mt-4 rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 overflow-x-auto">
      <code className="text-sm text-[var(--muted-foreground)] font-mono">{code}</code>
    </pre>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="mt-4 rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--border)] last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-[var(--muted-foreground)]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
