# slidenerds

Monorepo for the slidenerds presentation runtime, CLI, skill library, and platform.

## Project structure

```
slidenerds/
  packages/
    runtime/         # @slidenerds/runtime -- React component library (npm)
    cli/             # @slidenerds/cli -- npx slidenerds CLI (npm)
  apps/
    web/             # slidenerds.com -- Next.js 15, Supabase, deployed to Vercel
    supabase/        # Database schema, migrations, seed data
    ios/             # Native iOS companion app (Swift, SwiftUI)
  skills/            # 9 SKILL.md files following skills.sh format
```

- `packages/` contains code published to npm. Open source.
- `apps/web/` is the paid platform (auth, analytics, team features, billing).
- `apps/supabase/` is the database layer (Postgres, RLS, migrations).
- `apps/ios/` is the native iOS companion (presenter remote, offline notes).
- `skills/` contains LLM skill files. Open source.

Each directory has its own CLAUDE.md with specific context for that area.

## Commands

```bash
npm test              # Run all 93 tests (Vitest)
npm run build         # Build all packages
npm run lint          # ESLint
npm run format        # Prettier
npm run typecheck     # TypeScript strict mode check
```

## Key conventions

- npm workspaces monorepo (`packages/*` and `apps/*`)
- Vitest for all testing; test files live next to source files
- TypeScript strict mode, no `any`
- React 19, Next.js 15 App Router
- Supabase for auth, database, and storage
- RLS on every table, auth.uid() in all policies
- Data attributes: `data-slide`, `data-step`, `data-notes`
- Brand tokens via CSS custom properties from `brand.config.ts`
- Skills follow skills.sh SKILL.md format (YAML frontmatter + markdown)

## Boundaries for parallel work

When working on one area, do not modify files in another:

| Area | Scope | Safe to modify |
|------|-------|----------------|
| Runtime | `packages/runtime/` | Runtime source and tests only |
| CLI | `packages/cli/` | CLI source, tests, and templates only |
| Web | `apps/web/` | Web app source only |
| Supabase | `apps/supabase/` | Migrations and seed data only |
| iOS | `apps/ios/` | Swift source and Xcode project only |
| Skills | `skills/` | SKILL.md files and skill tests only |

The runtime's public API (`index.ts` exports) is the contract between packages. Change it only with coordination across all consumers.
