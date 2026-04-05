'use client'

type SlideTimeChartProps = {
  data: { slideIndex: number; avgSeconds: number }[]
}

export function SlideTimeChart({ data }: SlideTimeChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-[var(--muted-foreground)]">
        No slide data yet
      </div>
    )
  }

  const maxTime = Math.max(...data.map(d => d.avgSeconds), 1)

  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.slideIndex} className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted-foreground)] w-14 shrink-0">
            Slide {d.slideIndex + 1}
          </span>
          <div className="flex-1 h-5 bg-[var(--muted)] rounded-[var(--n-radius-sm)] overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-[var(--n-radius-sm)] transition-all"
              style={{ width: `${(d.avgSeconds / maxTime) * 100}%` }}
            />
          </div>
          <span className="text-xs text-[var(--muted-foreground)] w-10 text-right shrink-0">
            {d.avgSeconds}s
          </span>
        </div>
      ))}
    </div>
  )
}
