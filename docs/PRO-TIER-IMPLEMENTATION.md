# Pro tier implementation spec (items 1-6)

## Goal

Implement the "open source creation + linked cloud control plane" strategy without hosting user code on SlideNerds.

## Scope implemented now

1. Users build unlimited decks locally with open-source runtime.
2. Users host decks wherever they want (localhost, Vercel, Netlify, etc.).
3. `slidenerds link --url` links the external deck and provisions built-in telemetry wiring.
4. Deck analytics are rendered in SlideNerds dashboards while the deck is framed from external hosting.
5. Linked decks use SlideNerds live APIs/components (polls, Q&A, reactions, etc.).
6. The above becomes the Pro core value proposition.

## Architecture

### Runtime/data boundaries

- **Deck code/runtime:** hosted by customer (external origin).
- **Analytics + live data:** hosted by SlideNerds APIs.
- **Dashboard:** hosted by SlideNerds web app.
- **Security boundary:** SlideNerds never executes uploaded customer app bundles.

### Telemetry pipeline

1. User runs `slidenerds link --url https://their-deck-host`.
2. CLI creates (or links) a deck record.
3. CLI requests a deck-scoped telemetry token from SlideNerds using authenticated user credentials.
4. CLI writes local telemetry component + wiring (`components/slidenerds-telemetry.tsx`, `app/layout.tsx`).
5. Deployed deck sends per-slide dwell events to `POST /api/telemetry/slide`.
6. Dashboard reads `deck_views` data via existing analytics APIs/UI.

### Token model

- Format: signed HMAC token prefixed `sn_tlm_`.
- Claims: `deckId`, `ownerId`, issued-at, expiration.
- Verification: signature + expiry + deck/token match on ingest endpoint.
- Secret source: `SLIDENERDS_TELEMETRY_SECRET` (fallback `NEXTAUTH_SECRET`).

## Security controls

- No user code uploads.
- Token-gated telemetry ingest endpoint.
- Validation on telemetry payload (`deck_id`, `slide_index`, `dwell_seconds`).
- IP hashed before storage (`ip_hash`) to reduce raw PII exposure.
- CORS restricted to telemetry endpoint behavior (cross-origin POST/OPTIONS only).

## Product behavior

### CLI (`slidenerds link`)

- Registers external deck URL.
- Provisions telemetry token when available.
- Stores telemetry metadata in `.slidenerds.json`.
- Auto-creates/wires built-in telemetry client into common Next.js layout path when possible.
- Leaves room for users to inject additional custom analytics providers.

### Web dashboard

- Deck detail view continues to iframe external `deployed_url`.
- Analytics panel surfaces slide engagement from telemetry events.
- Live components continue using SlideNerds live APIs.

## Pro packaging (now)

- Linked deck registry
- Advanced sharing controls
- Granular slide telemetry + dashboards
- Live presentation data services
- Export pipeline

## Explicit non-goals (for this implementation)

- Hosting uploaded user app bundles on SlideNerds domains.
- Team sales/success attribution features (reserved for Team tier next round).
