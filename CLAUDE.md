# slidenerds

Monorepo for the slidenerds presentation runtime, CLI, and skill library.

## Project structure

- `packages/runtime/` -- `@slidenerds/runtime` React component library
- `packages/cli/` -- `npx slidenerds` CLI (create, export, analytics)
- `skills/` -- 9 SKILL.md files following skills.sh format

## Commands

```bash
npm test              # Run all 92 tests (Vitest)
npm run build         # Build all packages
npm run lint          # ESLint
npm run format        # Prettier
npm run typecheck     # TypeScript strict mode check
```

## Key conventions

- npm workspaces monorepo
- Vitest for all testing; test files live next to source files
- TypeScript strict mode, no `any`
- React 19, Next.js 15 App Router
- Data attributes: `data-slide`, `data-step`, `data-notes`
- Brand tokens via CSS custom properties from `brand.config.ts`
- Skills follow skills.sh SKILL.md format (YAML frontmatter + markdown)
