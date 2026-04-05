'use client'

const MOCK_SLIDES = [
  { title: 'Q2 Product Launch', active: true },
  { title: 'Timeline', active: false },
  { title: 'Key Metrics', active: false },
  { title: 'Risks', active: false },
]

const STATUS_ITEMS = [
  { label: 'Engineering', status: 'On track', color: '#22c55e' },
  { label: 'Design', status: 'On track', color: '#22c55e' },
  { label: 'Marketing', status: 'At risk', color: '#f59e0b' },
  { label: 'Launch prep', status: 'Not started', color: '#6b7280' },
]

export function MockSlidePreview() {
  return (
    <div className="flex h-full min-h-[280px]">
      <div className="w-28 shrink-0 bg-[#111] border-r border-[var(--border)] p-2 space-y-2">
        {MOCK_SLIDES.map((slide) => (
          <div
            key={slide.title}
            className={`rounded-[var(--n-radius-sm)] p-1.5 text-[8px] leading-tight ${
              slide.active
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] ring-1 ring-[var(--primary)]'
                : 'bg-[#1a1a1a] text-[var(--muted-foreground)]'
            }`}
          >
            <div className="aspect-video flex items-center justify-center">
              {slide.title}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center bg-[#0f0f0f]">
        <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest mb-1">
          Project status
        </div>
        <h3 className="text-base font-bold text-white mb-4">
          Q2 Product Launch
        </h3>

        <div className="space-y-2.5">
          {STATUS_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-[11px] text-[var(--muted-foreground)] w-20 shrink-0">
                {item.label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: item.status === 'On track' ? '75%' : item.status === 'At risk' ? '40%' : '0%',
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <span
                className="text-[10px] font-medium shrink-0"
                style={{ color: item.color }}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
          Last updated: Apr 3, 2026
        </div>
      </div>
    </div>
  )
}
