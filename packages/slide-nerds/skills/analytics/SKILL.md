---
name: analytics
description: How to add and configure analytics providers in slidenerds decks
---

# Analytics skill

How to add analytics to a slidenerds deck. Each provider has a pre-built component the CLI generates.

## Adding analytics via CLI

The fastest way to add analytics:

```bash
npx slidenerds analytics --gtm GTM-XXXXXX
npx slidenerds analytics --ga4 G-XXXXXXXXXX
npx slidenerds analytics --posthog phc_XXXXXXXXXX
npx slidenerds analytics --plausible yourdomain.com
npx slidenerds analytics --custom
```

Each command creates a component in `components/` with the provider ID wired in. Import it in your root layout to activate.

## Component placement

Analytics components go in the root layout, inside the `<body>` tag:

```tsx
import { SlideRuntime } from '@slidenerds/runtime'
import { GTMAnalytics } from '@/components/gtm-analytics'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GTMAnalytics />
        <SlideRuntime>{children}</SlideRuntime>
      </body>
    </html>
  )
}
```

## Provider details

### Google Tag Manager (GTM)

- ID format: `GTM-XXXXXX`
- Loads the GTM container script
- All tracking is configured inside GTM itself

### Google Analytics 4 (GA4)

- ID format: `G-XXXXXXXXXX`
- Loads the gtag.js script and initializes with the measurement ID
- Automatic page view tracking

### PostHog

- ID format: `phc_XXXXXXXXXX`
- Loads the PostHog array.js script
- Initializes with the project API key
- Captures page views and session recordings by default

### Plausible

- Domain format: `yourdomain.com`
- Loads the Plausible script with your domain
- Privacy-friendly, no cookie consent needed
- Automatic page view tracking

### Custom

- Creates a blank component with comments for manual wiring
- Use this for any provider not listed above

## Verifying the integration

After adding analytics:

1. Run `npm run dev`
2. Open the browser developer tools (Network tab)
3. Look for requests to the analytics provider's domain:
   - GTM: `googletagmanager.com`
   - GA4: `google-analytics.com`
   - PostHog: `app.posthog.com`
   - Plausible: `plausible.io`
4. Check the Console tab for any loading errors

## Platform analytics vs. first-party analytics

Slidenerds platform analytics (from slidenerds.com) and first-party analytics (GTM, GA4, etc.) coexist. They measure different things:

- **Platform analytics**: How decks perform across audiences (views, completion rate, slide dwell time). Opt-in when connecting a deck to slidenerds.com.
- **First-party analytics**: Whatever you were already tracking. Page views, user behavior, conversions.

Both run independently and don't interfere with each other.
