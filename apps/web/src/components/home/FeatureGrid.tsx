import {
  Sparkles, BookOpen, Terminal, Monitor, LayoutGrid, Radio,
  BarChart3, Link, Globe, Users, Palette, FileText,
  FileSpreadsheet, History, MessageSquare, Eye, Keyboard, Wand2,
} from 'lucide-react'

const FEATURES = [
  { icon: Sparkles, title: 'LLM-powered creation', desc: 'Use Claude, GPT, or any LLM to generate slides from a prompt.' },
  { icon: BookOpen, title: '18 built-in skills', desc: 'Layout, animation, data viz, diagrams, accessibility, and more.' },
  { icon: Terminal, title: 'CLI workflow', desc: 'Create, build, push, and export from your terminal.' },
  { icon: Monitor, title: 'Presenter mode', desc: 'Speaker notes, timer, and slide preview in a second window.' },
  { icon: LayoutGrid, title: 'Light table', desc: 'See all your slides at a glance and jump to any one.' },
  { icon: Radio, title: 'Live presentations', desc: 'Broadcast to an audience with real-time slide sync.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Track views, dwell time, and engagement per slide.' },
  { icon: Link, title: 'Share links', desc: 'Email, domain, and password-protected sharing.' },
  { icon: Globe, title: 'Custom domains', desc: 'Host your deck on your own domain with SSL.' },
  { icon: Users, title: 'Team workspaces', desc: 'Collaborate with your team on shared decks.' },
  { icon: Palette, title: 'Brand configs', desc: 'Consistent colors, fonts, and logos across all decks.' },
  { icon: FileText, title: 'PDF export', desc: 'Server-rendered PDF at 1920x1080. Pixel-perfect output.' },
  { icon: FileSpreadsheet, title: 'PPTX export', desc: 'Native PowerPoint with editable text and shapes.' },
  { icon: History, title: 'Version history', desc: 'Roll back to any previous version of your deck.' },
  { icon: MessageSquare, title: 'Comments', desc: 'Collect feedback on specific slides from reviewers.' },
  { icon: Eye, title: 'Public and private', desc: 'Control who can see your deck. Private by default.' },
  { icon: Keyboard, title: 'Keyboard shortcuts', desc: 'Navigate, present, and control everything from the keyboard.' },
  { icon: Wand2, title: 'Magic move', desc: 'Automatic animated transitions between matching elements.' },
] as const

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {FEATURES.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex gap-4">
          <div className="shrink-0 w-10 h-10 rounded-[var(--n-radius-md)] bg-[var(--muted)] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--foreground)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
