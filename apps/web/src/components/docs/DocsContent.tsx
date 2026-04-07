import Link from 'next/link'
import { CopyCodeBlock } from '@/components/home/CopyCodeBlock'

type DocsContentProps = {
  variant?: 'marketing' | 'dashboard'
}

export function DocsContent({ variant = 'marketing' }: DocsContentProps) {
  const isDashboard = variant === 'dashboard'

  return (
    <div className={isDashboard ? '' : 'max-w-3xl mx-auto py-16 px-6'}>
      <h1 className={isDashboard ? 'text-2xl font-bold mb-2' : 'text-4xl font-extrabold tracking-tight'}>
        {isDashboard ? 'Docs' : 'Getting started'}
      </h1>
      <p className={`${isDashboard ? 'mb-8' : 'mt-4'} text-sm text-[var(--muted-foreground)]`}>
        From first install to a live, analytics-enabled deck in under ten minutes.
      </p>

      {/* Step 1 */}
      <section className="mt-16">
        <StepHeader number="1" title="Create your deck" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          The CLI scaffolds a new Next.js project with the SlideNerds runtime, brand config, and 20 skill files pre-installed.
        </p>
        <div className="mt-4">
          <CopyCodeBlock code={`slidenerds create my-talk\ncd my-talk\nnpm install\nnpm run dev`} />
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Open <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">http://localhost:3000</code> to see your deck running. Every change hot-reloads instantly.
          All decks are code. See the{' '}
          <Link href={isDashboard ? '/help/reference' : '/docs/reference'} className="text-[var(--foreground)] font-medium hover:underline">
            slide definition language reference
          </Link>.
        </p>
      </section>

      {/* Step 2 */}
      <section className="mt-16">
        <StepHeader number="2" title="Slides are code" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Each slide is a React component in its own file. The deck&apos;s <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">page.tsx</code> is a manifest that imports slides and controls their order.
        </p>
        <div className="mt-4">
          <CopyCodeBlock code={`// app/slides/01-title.tsx\nexport default function Title() {\n  return (\n    <section data-slide="">\n      <h1>My talk</h1>\n    </section>\n  )\n}`} />
        </div>
        <div className="mt-4">
          <CopyCodeBlock code={`// app/page.tsx\nimport Title from './slides/01-title'\nimport Problem from './slides/02-problem'\nimport Solution from './slides/03-solution'\n\nexport default function Deck() {\n  return (\n    <main>\n      <Title />\n      <Problem />\n      <Solution />\n    </main>\n  )\n}`} />
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Reorder slides by moving one line in the manifest. Add a slide by creating a file and adding one import. The runtime discovers slides by their <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">data-slide</code> attribute in DOM order, so file structure is for human ergonomics only.
        </p>
      </section>

      {/* Step 3 */}
      <section className="mt-16">
        <StepHeader number="3" title="Build slides with an LLM" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Open Claude Code (or any LLM with file access) in the same directory. Give it a prompt and watch it build your slides.
        </p>

        <h3 className="mt-8 text-sm font-semibold">Example prompts</h3>

        <PromptExample
          prompt="Create a 6-slide product launch deck for our Q2 release. Include a title slide, problem statement, solution overview, three feature highlights, and a call to action."
          explanation="Good for structured decks. The LLM generates each slide as a section with data-slide attributes, using the brand config for colors and fonts."
        />

        <PromptExample
          prompt="Turn this markdown document into a presentation. Use the narrative-frameworks skill to structure it as a problem-solution-proof-CTA flow."
          explanation="References a specific skill file. The LLM reads the skill's guidelines and applies the framework to your content."
        />

        <PromptExample
          prompt="Add a live demo slide that embeds our React pricing calculator component. Import it from ../components/PricingCalculator and make it interactive."
          explanation="Slides are React components, so you can import and embed anything. Charts, demos, interactive widgets -- if it runs in React, it runs in your slide."
        />

        <PromptExample
          prompt="Create a data visualization slide showing our quarterly revenue growth. Use the data-visualization skill. Animate the bars on enter with data-step."
          explanation="The data-viz skill teaches the LLM how to build charts with CSS and SVG. The data-step attribute makes elements appear progressively when you advance."
        />

        <PromptExample
          prompt="Add speaker notes to every slide explaining the key talking points and transition cues. Use data-notes attributes."
          explanation="Speaker notes are stored as data-notes attributes on each slide. Press P during presentation to open the presenter view with notes, timer, and slide preview."
        />
      </section>

      {/* Step 4 */}
      <section className="mt-16">
        <StepHeader number="4" title="Navigate and present" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Your deck runs in the browser with keyboard navigation built in.
        </p>

        <div className="mt-6 rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th className="text-left px-4 py-3 font-medium">Key</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Arrow right / Space', 'Next slide or step'],
                ['Arrow left', 'Previous slide'],
                ['P', 'Toggle presenter mode'],
                ['L', 'Toggle light table'],
                ['F', 'Toggle fullscreen'],
                ['?', 'Show keyboard shortcuts'],
              ].map(([key, action]) => (
                <tr key={key} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2.5">
                    <kbd className="text-xs font-mono bg-[var(--muted)] px-2 py-0.5 rounded">{key}</kbd>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Step 5: Animations */}
      <section className="mt-16">
        <StepHeader number="5" title="Animate your slides" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Over 100 CSS animations are built into the runtime. Add a class to any element to animate it.
        </p>

        <h3 className="mt-8 text-sm font-semibold">Entrance animations (step-*)</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Elements with <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">data-step</code> start hidden and animate in when revealed. Add an animation class to control how they appear.
        </p>
        <div className="mt-3">
          <CopyCodeBlock code={`<p data-step="" className="step-fade">Fades in</p>\n<p data-step="" className="step-pop">Pops in with scale</p>\n<p data-step="" className="step-slide-in-left">Slides from left</p>\n<p data-step="" className="step-bounce">Bounces in</p>`} />
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Available: step-fade, step-pop, step-bounce, step-elastic, step-fly-in-*, step-move-*, step-scale-*, step-spin-in, step-flip-*, step-wipe-*, step-blur-in, step-typewriter, step-letter-spread, and more. See the <strong>animation</strong> skill for the full list.
        </p>

        <h3 className="mt-8 text-sm font-semibold">Exit animations (exit-*)</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Elements with <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">data-exit-step</code> animate out before the slide transitions.
        </p>
        <div className="mt-3">
          <CopyCodeBlock code={`<p data-exit-step="" className="exit-fade">Fades out</p>\n<p data-exit-step="" className="exit-zoom-out">Zooms out</p>`} />
        </div>

        <h3 className="mt-8 text-sm font-semibold">Emphasis animations (emphasis-*)</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Replay an animation on a visible element to draw attention. Triggered on second click.
        </p>
        <div className="mt-3">
          <CopyCodeBlock code={`<p data-step="" className="emphasis-pulse">Pulses on emphasis</p>\n<p data-step="" className="emphasis-shake">Shakes on emphasis</p>`} />
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Available: emphasis-pulse, emphasis-bounce, emphasis-shake, emphasis-wobble, emphasis-rubber-band, emphasis-tada, emphasis-heartbeat, emphasis-flash, emphasis-spin, emphasis-glow, and more.
        </p>

        <h3 className="mt-8 text-sm font-semibold">Auto-build animations (auto-*)</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Elements animate automatically when the slide becomes active. No click needed.
        </p>
        <div className="mt-3">
          <CopyCodeBlock code={`<div className="auto-fade">Fades in automatically</div>\n<div className="auto-pop" style={{ animationDelay: '200ms' }}>Pops in after 200ms</div>`} />
        </div>

        <h3 className="mt-8 text-sm font-semibold">Slide transitions (data-transition)</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Set the transition between slides with the <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">data-transition</code> attribute on a slide.
        </p>
        <div className="mt-3">
          <CopyCodeBlock code={`<section data-slide="" data-transition="cube-left">\n  <h1>This slide transitions with a 3D cube effect</h1>\n</section>`} />
        </div>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Available: fade, dissolve, push-*, slide-*, cover-*, uncover-*, zoom-in, zoom-out, flip-x, flip-y, cube-left, cube-right, iris, split-horizontal, split-vertical, morph.
        </p>
      </section>

      {/* Step 6: Create account (optional) */}
      <section className="mt-16">
        <StepHeader number="6" title="Create a SlideNerds account (optional)" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Create a free account to save your slides, manage brand settings, and access live features like polls, Q&A, and audience reactions. Deploy your deck anywhere, then link it to SlideNerds.
        </p>
        <div className="mt-4">
          <CopyCodeBlock code={`slidenerds login\nslidenerds link --name my-talk --url https://my-talk.vercel.app`} />
        </div>
      </section>

      {/* Step 7: Team */}
      <section className="mt-16">
        <StepHeader number="7" title="Invite your team" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Share your decks, brand configurations, and analytics with teammates. Invite anyone by email from the Team page in the dashboard.
        </p>

        <div className="mt-6 space-y-4">
          <FeatureCard title="Shared decks" description="Teammates see each other's decks in their dashboard." />
          <FeatureCard title="Shared brands" description="Brand configs are shared across the team so every deck stays on brand." />
          <FeatureCard title="Shared analytics" description="View engagement data across all team decks." />
          <FeatureCard title="Email invites" description="Invite teammates by email. They accept or decline from the link." />
        </div>
      </section>

      {/* Step 8: Analytics */}
      <section className="mt-16">
        <StepHeader number="8" title="Analytics" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Get per-slide analytics automatically when you link your deck to SlideNerds. Or bring your own analytics provider.
        </p>

        <div className="mt-6 space-y-4">
          <FeatureCard title="Built-in slide analytics" description="Per-slide dwell time, unique viewers, and engagement trends. Available in the deck analytics panel." />
          <FeatureCard title="Bring your own analytics" description="Add PostHog, Google Analytics 4, Google Tag Manager, Plausible, or a custom provider with one CLI command." />
        </div>
        <div className="mt-4">
          <CopyCodeBlock code={`slidenerds analytics --posthog phc_XXXXXXXXXX\nslidenerds analytics --ga4 G-XXXXXXXXXX\nslidenerds analytics --gtm GTM-XXXXXX`} />
        </div>
      </section>

      {/* Step 9: Export */}
      <section className="mt-16">
        <StepHeader number="9" title="Export to PDF or PowerPoint" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Export from the deck detail page or from the CLI. PDF renders server-side at 1920x1080. PPTX generates a native PowerPoint file with editable text.
        </p>
        <div className="mt-4">
          <CopyCodeBlock code={`slidenerds export --pdf\nslidenerds export --pptx`} />
        </div>
      </section>

      {/* Step 10: Brand */}
      <section className="mt-16">
        <StepHeader number="10" title="Manage brand configs" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Save and reuse brand configurations across decks. Upload your logo, set colors, fonts, and spacing. Create brands from the web UI or sync from the CLI.
        </p>
        <div className="mt-4">
          <CopyCodeBlock code={`slidenerds brand set "Acme Corp"\nslidenerds brand get "Acme Corp"\nslidenerds brand list`} />
        </div>

        <div className="mt-6 space-y-4">
          <FeatureCard title="Logo upload" description="Upload your brand logo. It's stored in SlideNerds and downloaded into your deck when you run brand get." />
          <FeatureCard title="Save from CLI" description="Run brand set to upload your current brand.config.ts (including logo) to the service." />
          <FeatureCard title="Apply from CLI" description="Run brand get to download a saved brand and write it to your local brand.config.ts." />
          <FeatureCard title="Create from web" description="Use the Brand page in the dashboard to create brands with color pickers, font selection, and logo upload." />
        </div>
      </section>

      {/* Step 11: Live */}
      <section className="mt-16">
        <StepHeader number="11" title="Add live interaction" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Add real-time audience interaction to your slides. Polls, reactions, Q&A, word clouds, and audience counts.
        </p>

        <h3 className="mt-8 text-sm font-semibold">1. Create a live session</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Go to your deck&apos;s settings page and scroll to <strong>Live sessions</strong>. Give your session a name (e.g. &quot;Q2 All-Hands&quot;) and click Create. You&apos;ll get a session ID and code snippet.
        </p>

        <h3 className="mt-6 text-sm font-semibold">2. Add live components to your slides</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Import the component and add it to a slide. The poll auto-creates itself when the slide loads.
        </p>
        <div className="mt-3">
          <CopyCodeBlock code={`import { LivePoll } from '@strategicnerds/slide-nerds'\n\n<section data-slide="">\n  <LivePoll\n    question="What is your biggest challenge?"\n    options={['Speed', 'Reliability', 'Cost']}\n  />\n</section>`} />
        </div>

        <h3 className="mt-6 text-sm font-semibold">3. Share with your audience</h3>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Share the session URL with your audience. Either hardcode the session ID in the component, or pass it as a URL parameter:
        </p>
        <div className="mt-3">
          <CopyCodeBlock code={`https://my-deck.vercel.app?session=SESSION_ID`} />
        </div>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          The audience opens the link, navigates to the poll slide, and votes. Results update in real time.
        </p>

        <div className="mt-6 space-y-4">
          <FeatureCard title="LivePoll" description="Real-time audience polls with clickable options and live bar chart results. Auto-creates the poll when the slide loads." />
          <FeatureCard title="LiveReactions" description="Floating emoji reactions (thumbsup, clap, heart, fire, mind blown)." />
          <FeatureCard title="LiveQA" description="Question submission with answered badges. Unanswered questions surface first." />
          <FeatureCard title="LiveWordCloud" description="Audience submits one word. Words display as a cloud sized by frequency." />
          <FeatureCard title="LiveAudienceCount" description="Pulsing dot showing how many people are watching." />
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          For local development, pass <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">serviceUrl=&quot;http://localhost:3000&quot;</code> to each component. See the <strong>live</strong> skill for full documentation.
        </p>
      </section>

      {/* Step 12: Share */}
      <section className="mt-16">
        <StepHeader number="12" title="Share and control access" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Decks are private by default. Share them with specific people or make them public.
        </p>

        <div className="mt-6 space-y-4">
          <FeatureCard title="Public sharing" description="Toggle a deck to public and anyone with the link can view it." />
          <FeatureCard title="Email-restricted links" description="Create a share link that only works for specific email addresses." />
          <FeatureCard title="Domain-restricted links" description="Allow anyone with a company email domain (e.g. @acme.com) to view." />
          <FeatureCard title="Password-protected links" description="Set a password on a share link. Recipients enter it before viewing." />
          <FeatureCard title="Expiring links" description="Set an expiration date on any share link." />
          <FeatureCard title="Tags" description="Organize your decks with color-coded tags. Tags are personal -- only you see your tags, even on shared decks. Create and manage tags from your Profile page, then filter your dashboard by tag to find what you need fast." />
        </div>
      </section>

      {/* Skills reference */}
      <section className="mt-16">
        <StepHeader number="13" title="Skills reference" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Every deck ships with 20 skill files that teach your LLM how to use SlideNerds effectively. Reference them in your prompts to get better results.
        </p>

        <div className="mt-6 rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th className="text-left px-4 py-3 font-medium">Skill</th>
                <th className="text-left px-4 py-3 font-medium">What it teaches</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['layout', 'Slide layout patterns and spacing'],
                ['advanced-layouts', 'Multi-column, grid, and complex compositions'],
                ['animation', '100+ CSS animations: entrance, exit, emphasis, auto-build, transitions'],
                ['brand', 'Brand config usage, theming, and logo integration'],
                ['data-visualization', 'Charts, graphs, and data displays'],
                ['deck-templates', 'Complete deck scaffolds by type'],
                ['diagrams', 'Flowcharts, architecture diagrams, timelines'],
                ['export', 'PDF and PPTX export configuration'],
                ['interactive', 'Interactive elements and live demos'],
                ['narrative-frameworks', 'Story structures and presentation flow'],
                ['react-component-embeds', 'Embedding React components in slides'],
                ['slide-organization', 'Multi-file deck structure and ordering'],
                ['slide-types', 'Title, content, comparison, quote slides'],
                ['slidenerds-runtime', 'Runtime API and data attributes'],
                ['speaker-notes', 'Adding and formatting speaker notes'],
                ['strategic-frameworks', 'Business frameworks (SWOT, etc.)'],
                ['visual-design', 'Color theory, typography, visual hierarchy'],
                ['analytics', 'Built-in and third-party analytics setup'],
                ['accessibility', 'Accessible slide design'],
                ['live', 'Live polls, reactions, Q&A, word clouds, audience count'],
              ].map(([skill, desc]) => (
                <tr key={skill} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2.5 font-mono text-xs">{skill}</td>
                  <td className="px-4 py-2.5 text-[var(--muted-foreground)]">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StepHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-sm font-bold shrink-0">
        {number}
      </span>
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
  )
}

function PromptExample({ prompt, explanation }: { prompt: string; explanation: string }) {
  return (
    <div className="mt-4 rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-sm font-medium leading-relaxed">{prompt}</p>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">{explanation}</p>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[var(--n-radius-md)] border border-[var(--border)] bg-[var(--card)] p-4">
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  )
}
