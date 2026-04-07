import type { Tag } from '@/lib/supabase/types'

type TagPillProps = {
  tag: Tag
  isActive?: boolean
  onClick?: () => void
}

export function TagPill({ tag, isActive = false, onClick }: TagPillProps) {
  const className = `inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
    isActive
      ? 'border-[var(--foreground)] text-[var(--foreground)]'
      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
  }`

  if (!onClick) {
    return (
      <span className={className} style={{ backgroundColor: `${tag.color}1A` }}>
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
        {tag.name}
      </span>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className} style={{ backgroundColor: `${tag.color}1A` }}>
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
      {tag.name}
    </button>
  )
}
