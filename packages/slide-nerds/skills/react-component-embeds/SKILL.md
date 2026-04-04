---
name: react-component-embeds
description: Build slides that embed reusable React components and live product demos directly inside section[data-slide] blocks
---

# React component embeds skill

Use this skill when a slide should host real React UI, not static markup. The goal is to keep demos composable, testable, and safe for presentation flow.

## When to use

Use this skill when the user asks for any of the following:

- Embed an app component directly inside a slide
- Turn a slide into a live demo surface
- Reuse an existing feature component inside presentation content
- Add interactive controls, local state, or network-backed UI in a slide

If the request is only static content, use layout or slide-type skills instead.

## Core pattern

1. Keep the slide shell simple (`section[data-slide]` plus layout container).
2. Move demo logic into a named React component.
3. Pass data through props, avoid global mutation.
4. Keep keyboard interactions compatible with deck navigation.
5. Add `data-notes` fallback instructions for offline or failure mode.

```tsx
const ProductDemo: React.FC<{ initialQuery: string }> = ({ initialQuery }) => {
  const [query, setQuery] = useState(initialQuery)

  return (
    <div className="card-surface p-6">
      <label className="text-sm" htmlFor="demo-query">Search</label>
      <input
        id="demo-query"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="mt-2 w-full rounded border px-3 py-2"
      />
    </div>
  )
}

<section data-slide="">
  <div className="flex flex-col w-full" style={{ padding: '4rem 6rem' }}>
    <p className="section-label mb-3">Live demo</p>
    <h2 className="text-[2.5rem] font-bold mb-8">Search behavior in production UI</h2>
    <ProductDemo initialQuery="onboarding" />
    <div data-notes="">
      If the API is unavailable, switch to cached demo data and continue narration.
    </div>
  </div>
</section>
```

## Interaction guardrails

- Stop slide-level keybindings while typing by using native `input`, `textarea`, or contentEditable elements.
- Keep heavy fetches lazy. Start data loading when the slide mounts or on explicit user action.
- For external systems, include a local fallback state so the deck can still run offline.
- Use small component boundaries so demos can be tested with React Testing Library.

## Quality checklist

Before finishing a slide with embedded components, verify:

- The component renders correctly inside `section[data-slide]`.
- User interaction works with mouse and keyboard.
- Slide navigation still works after interaction.
- Failure path is documented in `data-notes`.
- The demo can be reused outside slides without runtime-specific assumptions.
