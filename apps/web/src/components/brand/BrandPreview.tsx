import type { BrandConfigData } from '@/lib/brand'

type BrandPreviewProps = {
  config: BrandConfigData
  name: string
}

export function BrandPreview({ config, name }: BrandPreviewProps) {
  const { colors, fonts, spacing } = config

  return (
    <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-6 space-y-4">
      <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
        Preview
      </h2>

      <div
        className="rounded-[var(--n-radius-lg)] overflow-hidden shadow-lg"
        style={{
          backgroundColor: colors.background,
          padding: `${spacing.slide}px`,
          aspectRatio: '16 / 9',
        }}
      >
        <div
          className="h-full flex flex-col justify-between"
          style={{ gap: `${spacing.section}px` }}
        >
          <div style={{ gap: `${spacing.element}px` }} className="flex flex-col">
            <h3
              className="text-xl font-bold leading-tight"
              style={{ color: colors.text, fontFamily: fonts.heading }}
            >
              {name || 'Brand name'}
            </h3>
            <p
              className="text-xs leading-relaxed"
              style={{ color: colors.text, fontFamily: fonts.body, opacity: 0.7 }}
            >
              A sample slide with your brand colors and fonts applied. This shows how
              headings, body text, and accent elements look together.
            </p>
          </div>

          <div className="flex items-center" style={{ gap: `${spacing.element}px` }}>
            <div
              className="rounded-[6px] px-3 py-1.5"
              style={{ backgroundColor: colors.primary }}
            >
              <span
                className="text-[10px] font-semibold"
                style={{ color: colors.background, fontFamily: fonts.body }}
              >
                Primary button
              </span>
            </div>
            <div
              className="rounded-[6px] px-3 py-1.5 border"
              style={{ borderColor: colors.accent }}
            >
              <span
                className="text-[10px] font-semibold"
                style={{ color: colors.accent, fontFamily: fonts.body }}
              >
                Accent button
              </span>
            </div>
          </div>

          <div
            className="rounded-[var(--n-radius-md)] p-3"
            style={{ backgroundColor: colors.surface }}
          >
            <pre
              className="text-[9px] leading-relaxed"
              style={{ color: colors.text, fontFamily: fonts.mono, opacity: 0.8 }}
            >
              {'const brand = {\n  primary: "' + colors.primary + '",\n  accent: "' + colors.accent + '"\n}'}
            </pre>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {Object.entries(colors).map(([key, value]) => (
                <div
                  key={key}
                  className="w-5 h-5 rounded-full border border-black/10"
                  style={{ backgroundColor: value }}
                  title={key}
                />
              ))}
            </div>
            {config.logo?.src && (
              <img
                src={config.logo.src}
                alt="Logo"
                className="object-contain"
                style={{
                  width: config.logo.width ?? 32,
                  height: config.logo.height ?? 32,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
