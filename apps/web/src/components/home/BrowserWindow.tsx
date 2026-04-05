'use client'

type BrowserWindowProps = {
  children: React.ReactNode
  url?: string
}

export function BrowserWindow({ children, url = 'localhost:3000' }: BrowserWindowProps) {
  return (
    <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[#0a0a0a] overflow-hidden shadow-lg">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border-b border-[var(--border)]">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <div className="ml-2 flex-1 max-w-sm">
          <div className="px-3 py-1 rounded-[var(--n-radius-sm)] bg-[#0a0a0a] border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
            {url}
          </div>
        </div>
      </div>
      <div className="p-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
