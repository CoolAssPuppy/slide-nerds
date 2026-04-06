import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="mb-8 text-center py-16 rounded-[var(--n-radius-lg)] border border-dashed border-[var(--border)]">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 rounded-full bg-[var(--primary)]/10 flex items-center justify-center ring-8 ring-[var(--primary)]/5">
          <Icon size={24} className="text-[var(--primary)]" />
        </div>
      </div>
      <p className="text-[var(--muted-foreground)] mb-1">{title}</p>
      <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
    </div>
  )
}
