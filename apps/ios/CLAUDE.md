# iOS app (apps/ios)

Native iOS companion app for slidenerds. Swift 5.9+, iOS 17+.

## What lives here

- Presenter remote control (connect to a running deck, advance slides from your phone)
- Offline speaker notes viewer
- Deck analytics dashboard (read from Supabase)
- Push notifications for deck views and comments

## What does NOT live here

- The deck rendering engine (decks are web-based Next.js apps)
- The runtime or CLI code (packages/)
- The web platform (apps/web/)

## Architecture

- SwiftUI for all UI
- Supabase Swift SDK for auth and data
- WebSocket or BroadcastChannel bridge for presenter remote
- Xcode project at the root of this directory

## Status

Not yet started. This is the scaffold for future development.

## Stack

- SwiftUI (iOS 17+)
- Swift 5.9+
- Supabase Swift SDK
- Swift Package Manager for dependencies

## Getting started

```bash
open apps/ios/Slidenerds.xcodeproj
```

(Xcode project will be created when iOS development begins.)
