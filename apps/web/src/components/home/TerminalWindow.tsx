'use client'

type TerminalWindowProps = {
  children: React.ReactNode
  title?: string
}

export function TerminalWindow({ children, title = 'Terminal' }: TerminalWindowProps) {
  return (
    <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[#0a0a0a] overflow-hidden shadow-lg">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border-b border-[var(--border)]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-xs text-[var(--muted-foreground)]">{title}</span>
      </div>
      <div className="p-4 font-mono text-sm text-[#e0e0e0] min-h-[200px] overflow-hidden">
        {children}
      </div>
    </div>
  )
}
