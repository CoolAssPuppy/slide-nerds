---
name: speaker-notes
description: Conventions for writing and placing speaker notes in slidenerds decks
---

# Speaker notes skill

How to write and structure speaker notes that help the presenter deliver the talk.

## Where notes go

Place `data-notes` elements inside their parent slide. They are hidden during presentation and rendered in the presenter window (press `P`).

```tsx
<section data-slide="">
  <h2>Revenue growth</h2>
  <p>$4.2M ARR, up 142%</p>
  <div data-notes="">
    Lead with the number. Let it land for 3 seconds before explaining.
    Mention Q3 was the inflection point when enterprise deals closed.
    If asked about margins, pivot to the next slide.
  </div>
</section>
```

You can have multiple `data-notes` elements per slide:

```tsx
<section data-slide="">
  <h2>Three key metrics</h2>
  <div data-step="">
    <p>Revenue: $4.2M</p>
    <div data-notes="">Emphasize the growth rate, not the absolute number.</div>
  </div>
  <div data-step="">
    <p>Retention: 98%</p>
    <div data-notes="">Compare to industry average of 85%.</div>
  </div>
</section>
```

## Note length

Target 75 words per note block. That's roughly 30 seconds of speaking.

### Too short (unhelpful)

```
Talk about revenue.
```

### Too long (unreadable during delivery)

```
Revenue grew 142% year over year, driven primarily by enterprise deals
in Q3 that we secured through the new sales team we hired in Q1. The
sales team consists of four AEs and one SDR, each focused on a different
vertical. The enterprise vertical specifically saw 3x growth because we
launched the SOC 2 compliance feature in June which removed the biggest
blocker for procurement teams. We should mention that our CAC payback
period dropped from 18 months to 11 months as a result...
```

### Right length

```
Revenue grew 142%. Lead with the number, pause, then explain.
The inflection was Q3 enterprise deals -- SOC 2 compliance unlocked procurement.
If asked about CAC: payback dropped from 18 to 11 months.
```

## Timing cues

Use short directives in brackets for delivery timing:

```
[pause] -- Stop for 2-3 seconds. Let the audience absorb.
[ask the room] -- Pose a question, wait for hands or responses.
[wait for laughs] -- You just said something funny. Don't step on it.
[click] -- Reminder to advance to the next step.
[transition] -- Signal that you're moving to a new topic.
[demo] -- Switch to live demo. Have the window ready.
```

Example:

```tsx
<div data-notes="">
  $4.2M ARR [pause]. That's 142% growth in twelve months.
  [ask the room] How many of you have seen growth like that sustained past Series A?
  Most don't. Here's what made the difference for us. [click]
</div>
```

## Notes for talks you haven't memorized

Write complete sentences. Include the actual words you want to say, not just topics.

```tsx
<div data-notes="">
  "The problem isn't that developers can't build presentations.
  The problem is that every presentation tool optimizes for the wrong thing.
  They optimize for dragging boxes. We optimize for thinking."
  [pause] Let that land before moving on.
</div>
```

## Notes for talks you have memorized

Write prompts and reminders, not scripts. Trust yourself.

```tsx
<div data-notes="">
  Revenue slide. Lead with number. Mention Q3 inflection.
  Skip margin detail unless asked.
</div>
```

## How notes render in presenter mode

The presenter window shows:
- Current slide (live)
- Next slide preview
- All `data-notes` content for the current slide, concatenated in DOM order
- Running timer (MM:SS since start)
- Slide counter (current / total)

Notes are rendered as plain text. HTML formatting in notes is stripped. Keep notes as simple text.
