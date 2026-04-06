import Link from 'next/link'
import { CopyCodeBlock } from '@/components/home/CopyCodeBlock'

export const metadata = { title: 'Docs' }

export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-extrabold tracking-tight">Getting started</h1>
      <p className="mt-4 text-lg text-[var(--muted-foreground)]">
        From first install to an externally hosted, analytics-enabled deck in under ten minutes.
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
          <Link href="/docs/reference" className="text-[var(--foreground)] font-medium hover:underline">
            slide definition language reference
          </Link>.
        </p>
      </section>

      {/* Slides are code */}
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

      {/* Step 5 */}
      <section className="mt-16">
        <StepHeader number="5" title="Link your deployed deck" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Deploy your deck anywhere, then link it to SlideNerds for Pro analytics, sharing controls, and live services.
        </p>
        <div className="mt-4">
          <CopyCodeBlock code={`slidenerds login\nslidenerds link --name my-talk --url https://my-talk.vercel.app`} />
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Deploy your deck to Vercel, Netlify, or any static host first, then register the URL with SlideNerds. <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">slidenerds link</code> also provisions built-in SlideNerds telemetry so your deck can securely send per-slide events to the service.
        </p>
      </section>

      {/* Step 6 */}
      <section className="mt-16">
        <StepHeader number="6" title="Share and control access" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Decks are private by default. Share them with specific people or make them public.
        </p>

        <div className="mt-6 space-y-4">
          <FeatureCard title="Public sharing" description="Toggle a deck to public and anyone with the link can view it." />
          <FeatureCard title="Email-restricted links" description="Create a share link that only works for specific email addresses." />
          <FeatureCard title="Domain-restricted links" description="Allow anyone with a company email domain (e.g. @acme.com) to view." />
          <FeatureCard title="Password-protected links" description="Set a password on a share link. Recipients enter it before viewing." />
          <FeatureCard title="Expiring links" description="Set an expiration date on any share link." />
        </div>
      </section>

      {/* Step 7 */}
      <section className="mt-16">
        <StepHeader number="7" title="Use Pro analytics dashboards" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          On Pro, open the deck analytics panel to inspect granular slide telemetry while the deck itself stays hosted on your own infrastructure.
        </p>

        <div className="mt-6 space-y-4">
          <FeatureCard title="Granular slide events" description="Track per-slide enters/exits and dwell time from linked decks." />
          <FeatureCard title="Viewer-level timelines" description="Inspect how long each viewer spent on each slide across a session." />
          <FeatureCard title="Share + live correlation" description="Combine engagement metrics with share links and live interaction data." />
        </div>
      </section>

      {/* Step 8 */}
      <section className="mt-16">
        <StepHeader number="8" title="Export to PDF or PowerPoint" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Export from the deck detail page or from the CLI.
        </p>
        <div className="mt-4">
          <CopyCodeBlock code={`slidenerds export --pdf\nslidenerds export --pptx`} />
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          PDF export renders server-side at 1920x1080 with full CSS support. PPTX export extracts slide content into a native PowerPoint file.
        </p>
      </section>

      {/* Step 9 */}
      <section className="mt-16">
        <StepHeader number="9" title="Collaborate with your team" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          On the Team plan, create a workspace where members share decks, brand configs, and analytics.
        </p>

        <div className="mt-6 space-y-4">
          <FeatureCard title="Team workspaces" description="Invite team members. Everyone sees team decks in their dashboard." />
          <FeatureCard title="Shared brand configs" description="Set team-wide colors, fonts, and logos. Every deck stays on brand." />
          <FeatureCard title="Custom domains" description="Host your decks on your own domain with automatic SSL." />
          <FeatureCard title="Version history" description="Every push creates a version. Roll back to any previous version from the settings panel." />
          <FeatureCard title="Comments" description="Reviewers can leave feedback on specific slides." />
        </div>
      </section>

      {/* Step 10 */}
      <section className="mt-16">
        <StepHeader number="10" title="Manage brand configs" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Save and reuse brand configurations across decks. Create brands from the web UI or sync from the CLI.
        </p>
        <div className="mt-4">
          <CopyCodeBlock code={`slidenerds brand set "Acme Corp"\nslidenerds brand get "Acme Corp"\nslidenerds brand list`} />
        </div>

        <div className="mt-6 space-y-4">
          <FeatureCard title="Save from CLI" description="Run brand set to upload your current brand.config.ts to the service with a name." />
          <FeatureCard title="Apply from CLI" description="Run brand get to download a saved brand and write it to your local brand.config.ts." />
          <FeatureCard title="Create from web" description="Use the Brand page in the dashboard to create brands with color pickers and a live preview." />
          <FeatureCard title="Team brands" description="On the Team plan, brand configs are shared across the workspace so every deck stays on brand." />
        </div>
      </section>

      {/* Step 11 */}
      <section className="mt-16">
        <StepHeader number="11" title="Add live interaction" />
        <p className="mt-3 text-[var(--muted-foreground)] leading-relaxed">
          Embed live components in your slides for real-time audience interaction during presentations. These use SlideNerds live APIs and an active live session while your deck remains hosted externally.
        </p>
        <div className="mt-4">
          <CopyCodeBlock code={`import { LivePoll, LiveReactions, LiveQA } from '@strategicnerds/slide-nerds'\n\n<section data-slide="">\n  <LivePoll\n    question="What is your biggest challenge?"\n    options={['Speed', 'Reliability', 'Cost']}\n  />\n</section>`} />
        </div>

        <div className="mt-6 space-y-4">
          <FeatureCard title="LivePoll" description="Real-time audience polls with clickable options and live bar chart results." />
          <FeatureCard title="LiveReactions" description="Floating emoji reactions (thumbsup, clap, heart, fire, mind blown)." />
          <FeatureCard title="LiveQA" description="Question submission with answered badges. Unanswered questions surface first." />
          <FeatureCard title="LiveWordCloud" description="Audience submits one word. Words display as a cloud sized by frequency." />
          <FeatureCard title="LiveAudienceCount" description="Pulsing dot showing how many people are watching." />
        </div>
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          For local development, pass <code className="text-xs bg-[var(--muted)] px-1.5 py-0.5 rounded">serviceUrl=&quot;http://localhost:3000&quot;</code> to each component. See the <strong>live</strong> skill for full documentation.
        </p>
      </section>

      {/* Skills reference */}
      <section className="mt-16">
        <StepHeader number="12" title="Skills reference" />
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
                ['animation', 'CSS animations and data-step reveals'],
                ['brand', 'Brand config usage and theming'],
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
                ['analytics', 'Setting up view tracking'],
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
