# slide-nerds

Monorepo for the `@strategicnerds/slide-nerds` npm package: a presentation runtime, CLI, and LLM skill library for Next.js.

## Project structure

```
slide-nerds/
  packages/
    slide-nerds/       # @strategicnerds/slide-nerds (the npm package)
      src/
        runtime/       # React components (SlideRuntime, SlideShape, etc.)
        cli/           # CLI commands (create, analytics, export)
      templates/       # Scaffold templates (.tmpl files)
      skills/          # 19 SKILL.md files (bundled in package, copied on create)
  skills/              # Source skills (development copies, changes sync to packages/slide-nerds/skills/)
  apps/
    web/               # slidenerds.com (Next.js 15, Supabase, Vercel)
    supabase/          # Database schema, migrations, seed data
    ios/               # Native iOS companion app (Swift, SwiftUI)
```

The single published package is `packages/slide-nerds/`. The `packages/runtime/` and `packages/cli/` directories contain the original source and tests -- the unified package re-uses this code.

## Commands

```bash
npm test              # Run all 249 tests (Vitest)
npm run build         # Build all packages
npm run lint          # ESLint
npm run format        # Prettier
npm run typecheck     # TypeScript strict mode check
```

## Key conventions

- npm workspaces monorepo
- Single published package: `@strategicnerds/slide-nerds`
- Vitest for all testing; test files live next to source files
- TypeScript strict mode, no `any`
- React 19, Next.js 15 App Router
- Data attributes: `data-slide`, `data-step`, `data-notes`, `data-magic-id`
- Brand tokens via CSS custom properties from `brand.config.ts`
- Skills follow skills.sh SKILL.md format (YAML frontmatter + markdown)
- 19 skills covering layout, animation, data viz, frameworks, diagrams, accessibility, and more

## Boundaries for parallel work

| Area | Scope | Safe to modify |
|------|-------|----------------|
| Runtime | `packages/slide-nerds/src/runtime/` | Runtime source and tests |
| CLI | `packages/slide-nerds/src/cli/` | CLI source and tests |
| Templates | `packages/slide-nerds/templates/` | Scaffold templates |
| Skills | `skills/` and `packages/slide-nerds/skills/` | SKILL.md files |
| Web | `apps/web/` | Web app source only |
| Supabase | `apps/supabase/` | Migrations and seed data only |
| iOS | `apps/ios/` | Swift source and Xcode project only |

The runtime's public API (`src/runtime/index.ts` exports) is the contract. Change it with care.

---

## Development workflow

### TDD is non-negotiable

Write the test first. Always. The cycle is red, green, refactor. Write a failing test. Write the minimum code to make it pass. Then make it beautiful. Never skip the third step.

Test files live next to the code they test. `runtime.ts` and `runtime.test.ts` in the same directory.

Test behavior, not implementation. 100% coverage through business behavior, not by testing internal functions directly.

### Plan first, then build

Enter plan mode for any non-trivial task (3+ steps or architectural decisions). If something goes sideways, stop and re-plan immediately.

1. Write plan to `tasks/todo.md` with checkable items
2. Check in before starting implementation
3. Mark items complete as you go
4. Capture lessons in `tasks/lessons.md` after corrections

### Verification before done

Never mark a task complete without proving it works. Run tests, check logs, demonstrate correctness. Ask: "Would a staff engineer approve this?"

## Tech stack

- TypeScript over JavaScript unless explicitly told otherwise
- Next.js 15 App Router, not Pages Router
- iOS 17+ with Swift 5.9+ features
- npm (not yarn or pnpm)
- Supabase for database, auth, and storage
- Tailwind CSS
- Vitest for testing, React Testing Library for components

## Code style

### File structure

- Keep files under 300 lines. Break apart large files proactively.
- Functions under 30 lines. Classes under 200 lines.
- One responsibility per file, class, and function.

### Naming

- PascalCase for components and classes
- camelCase for variables, functions, and file names
- kebab-case for folder names
- Prefix booleans with `is`, `has`, `can`, or `should`
- Descriptive, intention-revealing names. No `data`, `info`, `temp`.

### Functional style

- No data mutation. Work with immutable data structures.
- Pure functions wherever possible.
- Array methods (`map`, `filter`, `reduce`) over imperative loops.
- No nested if/else. Use early returns and guard clauses.
- Max 2 levels of nesting.

### Options objects

Use options objects for function parameters as the default pattern. Only use positional parameters for single-parameter pure functions or well-established conventions like `map(item => item.value)`.

### Imports

- Group imports: external libraries first, then internal modules, then relative imports
- Separate each group with a blank line
- No barrel files that re-export everything from a directory

### TypeScript

- No `any`. Use `unknown` if type is truly unknown.
- No type assertions (`as SomeType`) unless absolutely necessary.
- No `@ts-ignore` or `@ts-expect-error` without explanation.
- Prefer `type` over `interface` for data structures. Reserve `interface` for behavior contracts (ports, adapters, DI).
- Use Zod schemas at trust boundaries, derive types with `z.infer<>`.

### Self-documenting code

Code should be self-documenting through clear naming and structure. No comments explaining what the code does. Only comment non-obvious "why" (hidden constraints, subtle invariants, workarounds).

## Testing

### Principles

- Write tests first (TDD, non-negotiable)
- Test behavior, not implementation
- No `any` types or type assertions in test code
- Use factory functions for test data (no `let`/`beforeEach` for shared mutable state)
- Validate factory output against real schemas when schemas exist

### Tools

- Vitest for all packages
- React Testing Library for components
- MSW for API mocking when needed

### Anti-patterns

- No spying on internal functions
- No 1:1 mapping between test files and implementation files
- No `let` + `beforeEach` for test data (use factory functions instead)

## Security

### Database

- Always use Row Level Security (RLS) policies instead of supabaseAdmin for user data access
- Never bypass RLS with service role keys in client-side code
- Use the authenticated user context for all database operations

### Auth

- Validate user permissions before database operations
- Use Supabase built-in auth, not custom implementations
- Never store sensitive data in client-side storage without encryption
- Environment variables for all API keys and secrets

### Code

- Parameterized queries to prevent SQL injection
- Validate and sanitize all user inputs on both client and server
- Never log sensitive user data (passwords, tokens, personal information)
- Never commit secrets, API keys, or environment files to version control

## Git

- Present tense commit messages: "Add feature" not "Added feature"
- Keep commits focused on a single logical change
- Include the "why" in commit messages when the "what" isn't obvious

## Writing (for docs, READMs, skill files)

- No emoji or emdashes
- Sentence case for headers
- Get to the point. No throat-clearing.
- Vary sentence length. Mix short and long.
- Be specific. Use numbers, names, details.
- Banned words: delve, dive into, unpack, harness, leverage, utilize, game-changer, cutting-edge, revolutionary, unlock, landscape, ecosystem (unless literal), robust, seamless, streamline, elevate, empower, navigate (metaphorical), reimagine, supercharge, synergy, holistic, paradigm, disrupt, innovative
