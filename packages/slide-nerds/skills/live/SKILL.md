---
name: live
description: SlideNerds live presentation components -- polls, reactions, Q&A, audience count, word clouds
---

# Live presentation components

Use this skill when slides need real-time audience interaction during a live presentation. These components connect to the slidenerds.com service and require an active live session.

## Prerequisites

1. The deck must be linked to slidenerds.com (`slidenerds link --url <deployed-url>`)
2. The presenter creates a live session from the deck settings page on slidenerds.com (Settings > Live sessions > Create)
3. The audience opens the deck URL with the session parameter

All components are exported from `@strategicnerds/slide-nerds`. Import them directly.

## Connecting to a session

There are three ways to connect live components to a session. Pick one.

### Option 1: URL parameter (recommended for flexibility)

Pass the session ID as a URL parameter when sharing with the audience. No code changes needed per session.

```
https://my-deck.vercel.app?session=SESSION_ID
```

Components auto-detect `?session=` from the URL. No props needed:

```tsx
<LivePoll question="Your question" options={['A', 'B', 'C']} />
```

### Option 2: Embed session ID in code

Hardcode the session ID in the component props. Good when a deck is always used with the same session.

```tsx
<LivePoll
  question="Your question"
  options={['A', 'B', 'C']}
  sessionId="SESSION_ID"
/>
```

Get the session ID from the deck settings page on slidenerds.com after creating a session.

### Option 3: Embed session name in code

Use a human-readable session name instead of a UUID. Requires the deck ID (from `.slidenerds.json`) so the runtime can resolve the name to an active session.

```tsx
<LivePoll
  question="Your question"
  options={['A', 'B', 'C']}
  sessionName="Q2 All-Hands"
  deckId="DECK_ID"
/>
```

The deck ID is in `.slidenerds.json` after running `slidenerds link`. You can also pass the session name as a URL parameter:

```
https://my-deck.vercel.app?session-name=Q2-All-Hands
```

When using `session-name` in the URL, you still need `deckId` as a prop so the runtime knows which deck to resolve against.

## All live component props

Every live component accepts these props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sessionId` | `string` | No | Direct session ID. Auto-detected from `?session=` URL param |
| `sessionName` | `string` | No | Session name to resolve. Requires `deckId`. Also reads `?session-name=` from URL |
| `deckId` | `string` | No | Deck ID for name resolution. Found in `.slidenerds.json` |
| `serviceUrl` | `string` | No | Defaults to `https://slidenerds.com`. Use `http://localhost:3000` for local dev |

Resolution priority: `sessionId` prop > `?session=` URL param > `sessionName` + `deckId` resolution.

## Components

### LivePoll

Real-time audience poll. Audience votes by clicking an option. Results update live.

```tsx
import { LivePoll } from '@strategicnerds/slide-nerds'

<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}
    className="flex flex-col items-center justify-center min-h-screen">
    <h2 className="text-[2.5rem] font-bold mb-8">Quick poll</h2>
    <LivePoll
      question="What is your biggest deployment challenge?"
      options={['Speed', 'Reliability', 'Cost', 'Complexity']}
    />
  </div>
</section>
```

**Additional props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `question` | `string` | Yes | The poll question displayed to the audience |
| `options` | `string[]` | Yes | Array of answer choices |

**Behavior:**
- Shows clickable option buttons before voting
- After voting, switches to a bar chart showing live results
- One vote per viewer (tracked by IP hash)
- Results update every 5 seconds via polling

### LiveReactions

Floating reaction buttons. Audience taps to send reactions. Emojis float up and fade out.

```tsx
import { LiveReactions } from '@strategicnerds/slide-nerds'

<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}
    className="flex flex-col items-center justify-center min-h-screen">
    <h2 className="text-[2.5rem] font-bold mb-4">What do you think?</h2>
    <LiveReactions />
  </div>
</section>
```

**Available reactions:** thumbsup, clap, heart, fire, mind_blown

**Behavior:**
- Five reaction buttons at the bottom
- Clicking sends a reaction and shows a floating emoji
- Other audience reactions also appear as floating emojis
- Emojis fade out after 3 seconds

### LiveQA

Question submission and display. Audience submits questions, presenter can mark them answered.

```tsx
import { LiveQA } from '@strategicnerds/slide-nerds'

<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}
    className="flex flex-col items-center justify-center min-h-screen">
    <h2 className="text-[2.5rem] font-bold mb-4">Questions?</h2>
    <LiveQA />
  </div>
</section>
```

**Behavior:**
- Text input for submitting questions (with optional name)
- Scrollable list of submitted questions
- Unanswered questions appear first
- Answered questions show a green badge
- Questions update every 5 seconds

### LiveAudienceCount

Shows how many people are watching the live presentation.

```tsx
import { LiveAudienceCount } from '@strategicnerds/slide-nerds'

<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}
    className="flex flex-col items-center justify-center min-h-screen">
    <LiveAudienceCount />
    <h2 className="text-[2.5rem] font-bold mt-8">Welcome, everyone</h2>
  </div>
</section>
```

**Behavior:**
- Shows "X watching" with a pulsing green dot
- Automatically joins on mount, leaves on unmount
- Count updates every 5 seconds

### LiveWordCloud

Audience submits one word or short phrase. Words appear as a cloud sized by frequency.

```tsx
import { LiveWordCloud } from '@strategicnerds/slide-nerds'

<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}
    className="flex flex-col items-center justify-center min-h-screen">
    <h2 className="text-[2.5rem] font-bold mb-8">In one word, describe your experience</h2>
    <LiveWordCloud prompt="One word that describes your experience" />
  </div>
</section>
```

**Additional props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `prompt` | `string` | Yes | The prompt shown above the input |

**Behavior:**
- Text input for submitting a word (max 50 characters)
- One submission per viewer per slide
- Words display as a cloud with font sizes scaled by frequency
- Cloud updates every 5 seconds

## Local development

For local dev, pass `serviceUrl` to each component:

```tsx
<LivePoll
  question="Test poll"
  options={['A', 'B', 'C']}
  serviceUrl="http://localhost:3000"
/>
```

Create a live session from the deck settings page at localhost:3000 (Settings > Live sessions), then either:
- Pass the session ID in the URL: `http://localhost:3001?session=SESSION_ID`
- Embed it in the component: `sessionId="SESSION_ID"`

## Combining components

You can put multiple live components on a single slide:

```tsx
<section data-slide="">
  <div style={{ padding: 'var(--slide-padding)' }}
    className="flex flex-col items-center justify-center min-h-screen">
    <div className="flex items-center justify-between w-full mb-8">
      <h2 className="text-[2.5rem] font-bold">Let's hear from you</h2>
      <LiveAudienceCount />
    </div>
    <div className="grid grid-cols-2 gap-8 w-full">
      <LivePoll
        question="How are we doing?"
        options={['Great', 'Good', 'Okay', 'Needs work']}
      />
      <LiveQA />
    </div>
    <LiveReactions />
  </div>
</section>
```

## Reactions on every slide

To keep reactions available across all slides, add the component to your layout:

```tsx
// app/layout.tsx
import { LiveReactions } from '@strategicnerds/slide-nerds'
import { SlideRuntime } from '@strategicnerds/slide-nerds'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SlideRuntime>{children}</SlideRuntime>
        <LiveReactions />
      </body>
    </html>
  )
}
```

## When not to use these components

- **Static presentations** that won't be presented live. The components show "No active session" without a live session.
- **Offline presentations**. The components require an internet connection to reach the slidenerds.com API.

For static audience interaction patterns (QR codes, feedback links), use the interactive skill instead.
