'use client'

type ViewsChartProps = {
  data: { date: string; count: number }[]
}

export function ViewsChart({ data }: ViewsChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-[var(--muted-foreground)]">
        No view data yet
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count), 1)
  const width = 600
  const height = 180
  const padding = { top: 10, right: 10, bottom: 30, left: 40 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const points = data.map((d, i) => ({
    x: padding.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padding.top + chartH - (d.count / maxCount) * chartH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
      {/* Y axis labels */}
      <text x={padding.left - 8} y={padding.top + 4} textAnchor="end" className="fill-[var(--muted-foreground)]" fontSize="10">
        {maxCount}
      </text>
      <text x={padding.left - 8} y={padding.top + chartH + 4} textAnchor="end" className="fill-[var(--muted-foreground)]" fontSize="10">
        0
      </text>

      {/* X axis labels (first and last) */}
      <text x={padding.left} y={height - 5} textAnchor="start" className="fill-[var(--muted-foreground)]" fontSize="10">
        {data[0].date}
      </text>
      <text x={width - padding.right} y={height - 5} textAnchor="end" className="fill-[var(--muted-foreground)]" fontSize="10">
        {data[data.length - 1].date}
      </text>

      {/* Area fill */}
      <path d={areaPath} fill="var(--primary)" opacity="0.1" />

      {/* Line */}
      <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--primary)" />
      ))}
    </svg>
  )
}
