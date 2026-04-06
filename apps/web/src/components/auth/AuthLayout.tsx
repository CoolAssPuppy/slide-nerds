type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%)',
      }}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(62, 207, 142, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(108, 99, 255, 0.1) 0%, transparent 50%)',
        }} />
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 max-w-lg mx-auto">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">SlideNerds</h1>
          <p className="mt-3 text-lg text-white/70">
            Build presentations with code. Let AI do the design.
          </p>

          <div className="mt-12 space-y-6">
            <Feature
              title="20 built-in skills"
              description="Point Claude or GPT at your project. The LLM reads the skills and builds slides that look like a designer made them."
            />
            <Feature
              title="100+ animations"
              description="Entrance, exit, emphasis, auto-build, and slide transitions. All CSS, no JavaScript overhead."
            />
            <Feature
              title="Live audience interaction"
              description="Polls, Q&A, reactions, word clouds, and audience counts. Real-time, built into your slides."
            />
            <Feature
              title="Per-slide analytics"
              description="Track dwell time, unique viewers, and engagement. Know which slides land and which lose the room."
            />
            <Feature
              title="Free and open source"
              description="The runtime and CLI are MIT licensed. An account unlocks team sharing, brand sync, and live features."
            />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-white/50 leading-relaxed">{description}</p>
    </div>
  )
}
