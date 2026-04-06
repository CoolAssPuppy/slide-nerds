---
name: live
description: SlideNerds live presentation components -- polls, reactions, Q&A, audience count, word clouds. Requires slidenerds.com hosting.
---

# Live presentation components

Use this skill when slides need real-time audience interaction during a live presentation. These components connect to the slidenerds.com service and only work when the deck is hosted there and a live session is active.

## Prerequisites

1. The deck must be pushed to slidenerds.com (`slidenerds push`)
2. The presenter starts a live session from the deck detail page
3. The audience joins via the live URL

All components are exported from `@strategicnerds/slide-nerds`. Import them directly.

## Components

### LivePoll

Real-time audience poll. Audience votes by clicking an option. Results update live as votes come in.

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

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `question` | `string` | Yes | The poll question displayed to the audience |
| `options` | `string[]` | Yes | Array of answer choices |
| `sessionId` | `string` | No | Live session ID. Auto-detected from `?session=` URL param |
| `serviceUrl` | `string` | No | SlideNerds service URL. Defaults to `https://slidenerds.com`. Use `http://localhost:3000` for local dev |

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
    <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
      React to let us know
    </p>
    <LiveReactions />
  </div>
</section>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sessionId` | `string` | No | Live session ID |
| `serviceUrl` | `string` | No | Service URL |

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
    <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
      Submit your questions below
    </p>
    <LiveQA />
  </div>
</section>
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sessionId` | `string` | No | Live session ID |
| `serviceUrl` | `string` | No | Service URL |

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

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `sessionId` | `string` | No | Live session ID |
| `serviceUrl` | `string` | No | Service URL |

**Behavior:**
- Shows "X watching" with a pulsing green dot
- Automatically joins on mount, leaves on unmount
- Count updates every 5 seconds

### LiveWordCloud

Audience submits one word or short phrase. Words appear as a growing cloud with size proportional to frequency.

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

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `prompt` | `string` | Yes | The prompt shown above the input |
| `sessionId` | `string` | No | Live session ID |
| `serviceUrl` | `string` | No | Service URL |

**Behavior:**
- Text input for submitting a word (max 50 characters)
- One submission per viewer per slide
- Words display as a cloud with font sizes scaled by frequency
- Cloud updates every 5 seconds

## Local development

For local development, pass `serviceUrl` to each component:

```tsx
<LivePoll
  question="Test poll"
  options={['A', 'B', 'C']}
  serviceUrl="http://localhost:3000"
/>
```

You need a running live session. Start one from the deck detail page on localhost:3000, then add `?session=SESSION_ID` to your deck's local dev URL.

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

## Slide with reactions always visible

To keep reactions available across all slides (not just one), add the component to your layout instead of a specific slide:

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
- **Self-hosted decks** not pushed to slidenerds.com. The components call the slidenerds.com API.
- **Offline presentations**. The components require an internet connection.

For static audience interaction patterns (QR codes, feedback links), use the interactive skill instead.
