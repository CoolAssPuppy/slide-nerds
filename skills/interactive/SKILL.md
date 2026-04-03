---
name: interactive
description: Embedded video, QR codes, clickable links, live data, and audience interaction patterns for slidenerds slides
---

# Interactive elements skill

Use this skill when slides need dynamic or interactive content beyond static text and charts. Each pattern here produces a functional component that works within the slidenerds runtime.

## Embedded video

Use for: product demos, customer testimonials, recorded walkthroughs.

### YouTube / Vimeo embed

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center items-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Demo</p>
    <h2 className="text-[2.5rem] font-bold mb-10">See it in action</h2>
    <div data-step="" className="step-fade w-full" style={{ maxWidth: 900 }}>
      <div className="card-surface overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <iframe
          src="https://www.youtube.com/embed/VIDEO_ID?rel=0&modestbranding=1"
          title="Product demo"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    </div>
    <div data-notes="">
      Play the video. Pause at 1:45 to highlight the auto-scaling feature.
    </div>
  </div>
</section>
```

### Self-hosted video

```tsx
<div className="card-surface overflow-hidden" style={{ aspectRatio: '16/9' }}>
  <video
    src="/demo.mp4"
    controls
    playsInline
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
</div>
```

### Video rules

- Always wrap in a card surface with 16:9 aspect ratio.
- Use `rel=0&modestbranding=1` for YouTube to hide related videos and branding.
- Never autoplay. The presenter controls playback.
- Keep videos under 2 minutes for live presentations.
- Include speaker notes that describe what to narrate during the video.

## QR code

Use for: audience participation, resource links, app downloads, feedback forms.

Install `qrcode.react`:

```bash
npm install qrcode.react
```

```tsx
import { QRCodeSVG } from 'qrcode.react'

<section data-slide="">
  <div className="flex items-center justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <div className="flex items-center gap-16">
      <div>
        <p className="section-label mb-3">Try it now</p>
        <h2 className="text-[2.5rem] font-bold mb-4">Scan to get started</h2>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Free trial, no credit card required.
        </p>
        <p className="mt-6 text-sm font-mono" style={{ color: 'var(--color-text-tertiary)' }}>
          acme.dev/start
        </p>
      </div>
      <div className="card-surface p-6">
        <QRCodeSVG
          value="https://acme.dev/start"
          size={200}
          bgColor="transparent"
          fgColor="var(--color-text)"
          level="M"
        />
      </div>
    </div>
  </div>
</section>
```

### QR code rules

- Size: at least 200x200px on screen. Must be scannable from 3 meters.
- Always include the URL in plain text below or beside the QR code.
- Use `level="M"` (medium error correction) for reliability.
- Place the QR code on the right side of the slide (audience's eye tracks left-to-right, reads context first, then scans).
- Use `bgColor="transparent"` to match the slide background.

## Clickable links

Use for: resources, documentation, signup pages within the deck.

```tsx
<a
  href="https://docs.acme.dev"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
  style={{
    background: 'var(--color-accent-dim)',
    color: 'var(--color-accent)',
    textDecoration: 'none',
    transition: 'background 150ms ease',
  }}
>
  View documentation
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
</a>
```

### Link rules

- Style links as pill buttons, not underlined text. Underlines are hard to see at projection distance.
- Always use `target="_blank"` and `rel="noopener noreferrer"`.
- Include an external-link icon to signal the link opens a new tab.
- Place links at the bottom of slides, not inline with body text.
- Limit to 1-2 links per slide.

## Embedded web content

Use for: live dashboards, interactive prototypes, web apps.

```tsx
<section data-slide="">
  <div className="flex flex-col justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Live</p>
    <h2 className="text-[2.5rem] font-bold mb-8">Real-time dashboard</h2>
    <div className="card-surface overflow-hidden flex-1" style={{ minHeight: 400 }}>
      <iframe
        src="https://dashboard.acme.dev/embed?token=xyz"
        title="Live metrics dashboard"
        sandbox="allow-scripts allow-same-origin"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
    <div data-notes="">
      This is a live embed. Refresh if data looks stale. Have a screenshot backup ready.
    </div>
  </div>
</section>
```

### Embed rules

- Always use the `sandbox` attribute to restrict iframe capabilities.
- Have a static screenshot as a fallback in case of network issues.
- Test the embed before presenting -- auth tokens, CORS, and CSP can block iframes.
- Include a note in speaker notes about fallback behavior.

## Presenter timer with alerts

The runtime's presenter view shows elapsed time. For more control, add configurable alerts:

```tsx
const ALERT_TIMES = [
  { seconds: 15 * 60, label: '15 min remaining', color: '#22c55e' },
  { seconds: 18 * 60, label: '2 min remaining', color: '#f59e0b' },
  { seconds: 19 * 60, label: '1 min remaining', color: '#ef4444' },
]
```

Display these as toast notifications in the presenter view when the timer crosses each threshold.

## Click-to-zoom on charts and images

For detailed charts that need closer inspection:

```tsx
const [zoomed, setZoomed] = useState(false)

<div onClick={() => setZoomed(!zoomed)}
  style={{
    cursor: 'zoom-in',
    transition: 'transform 300ms ease',
    transform: zoomed ? 'scale(1.5)' : 'scale(1)',
    transformOrigin: 'center',
    zIndex: zoomed ? 100 : 'auto',
    position: 'relative',
  }}>
  <ResponsiveContainer width="100%" height={400}>
    {/* Chart */}
  </ResponsiveContainer>
</div>
```

### Zoom rules

- Only use on data-dense charts that benefit from closer inspection.
- Scale factor: 1.5x (not more -- it pushes content off screen).
- Click to zoom in, click again to zoom out.
- Not appropriate for keynote-style presentations. Use only for working sessions and reviews.

## Audience interaction patterns

### Live poll (requires backend)

For real-time polling during presentations, integrate with a polling service or build a custom WebSocket solution:

```tsx
<section data-slide="">
  <div className="flex flex-col items-center justify-center w-full min-h-screen"
    style={{ padding: '4rem 6rem' }}>
    <h2 className="text-[2.5rem] font-bold mb-4">Quick poll</h2>
    <p className="text-lg mb-10" style={{ color: 'var(--color-text-secondary)' }}>
      What is your biggest deployment challenge?
    </p>
    <div className="card-surface p-6 w-full" style={{ maxWidth: 600 }}>
      {/* Poll results render here -- driven by real-time data */}
      <div className="space-y-3">
        {['Speed', 'Reliability', 'Cost', 'Complexity'].map((option) => (
          <div key={option} className="flex items-center gap-3">
            <div className="h-8 rounded"
              style={{ width: `${Math.random() * 80 + 20}%`, background: 'var(--color-accent)', opacity: 0.6 }} />
            <span className="text-sm">{option}</span>
          </div>
        ))}
      </div>
    </div>
    <p className="mt-8 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
      Vote at acme.dev/poll
    </p>
  </div>
</section>
```

### Feedback / Q&A prompt

Simple pattern for soliciting audience questions:

```tsx
<section data-slide="">
  <div className="flex flex-col items-center justify-center w-full min-h-screen text-center"
    style={{ padding: '4rem 6rem' }}>
    <h2 className="text-[3.5rem] font-bold mb-4">Questions?</h2>
    <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
      Submit at acme.dev/ask or raise your hand.
    </p>
    <div className="mt-10 card-surface p-6">
      <QRCodeSVG value="https://acme.dev/ask" size={160}
        bgColor="transparent" fgColor="var(--color-text)" level="M" />
    </div>
  </div>
</section>
```

## Interactive element selection guide

| Need | Element | Dependency |
|---|---|---|
| Product walkthrough | YouTube/Vimeo embed | None (iframe) |
| Recorded demo | Self-hosted video | None (HTML5 video) |
| Resource link | Pill button with icon | None |
| Audience participation | QR code | `qrcode.react` |
| Live metrics | Embedded iframe | Backend/dashboard service |
| Data inspection | Click-to-zoom chart | None (CSS transform) |
| Audience voting | Live poll | WebSocket backend |
| Feedback collection | Q&A QR code slide | `qrcode.react` |

## What to avoid

- Autoplay on any media. The presenter controls pacing.
- More than one interactive element per slide.
- Relying on network connectivity without a fallback.
- Interactive prototypes without a pre-recorded backup video.
- Polls or live data in the first half of a presentation. Build credibility before asking for participation.
