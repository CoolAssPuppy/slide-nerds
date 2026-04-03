# Testing locally

How to test the runtime and CLI without publishing to npm.

## Run the test suite

```bash
npm test
```

This runs all 93 tests across the runtime, CLI, and skill validation. No build step required -- Vitest handles TypeScript natively.

## Test the runtime in a real Next.js deck

### Option A: npm link (recommended)

Build the runtime, then link it into a test deck:

```bash
# Build the runtime package
cd packages/runtime
npm run build
npm link

# Create a test deck using the CLI
cd ../..
node packages/cli/src/index.ts create test-deck
cd test-deck

# Link the local runtime instead of pulling from npm
npm link @slidenerds/runtime
npm install
npm run dev
```

Open http://localhost:3000. The deck uses your local runtime build. When you make changes to the runtime source:

```bash
# Rebuild after changes
cd ../packages/runtime
npm run build

# The linked package updates automatically -- just refresh the browser
```

### Option B: file protocol dependency

Skip linking entirely. In the test deck's `package.json`, point the dependency at your local build:

```json
{
  "dependencies": {
    "@slidenerds/runtime": "file:../packages/runtime"
  }
}
```

Then `npm install` in the test deck. This creates a symlink. Rebuild the runtime after changes.

### Option C: npm workspaces (zero config)

If you create the test deck inside this monorepo, workspaces resolve the dependency automatically:

```bash
# From the repo root
mkdir decks
node packages/cli/src/index.ts create decks/test-deck
```

Add `"decks/*"` to the root `package.json` workspaces array:

```json
{
  "workspaces": [
    "packages/*",
    "decks/*"
  ]
}
```

Then `npm install` from the root. The workspace links `@slidenerds/runtime` to your local build with no extra steps.

## Test the CLI

The CLI is not built to `dist/` during development. Run it directly with Node:

```bash
# Create a deck
node packages/cli/src/index.ts create my-test-deck

# Export (requires a running dev server at localhost:3000)
node packages/cli/src/index.ts export --pdf
node packages/cli/src/index.ts export --pptx

# Add analytics
cd my-test-deck
node ../packages/cli/src/index.ts analytics --ga4 G-FAKE123
```

To test the CLI as if it were installed globally via `npx`:

```bash
cd packages/cli
npm link

# Now usable from anywhere
slidenerds create my-deck
slidenerds export --pdf
```

## Test the export commands

Export requires a running dev server and Puppeteer (which downloads Chromium on first run).

```bash
# Terminal 1: start the deck
cd test-deck
npm run dev

# Terminal 2: export
node ../packages/cli/src/index.ts export --pdf --url http://localhost:3000
node ../packages/cli/src/index.ts export --pptx --url http://localhost:3000
```

The PDF and PPTX files appear in the current directory.

## Test skills

The skill validation test checks that every SKILL.md file has valid YAML frontmatter, a name matching its directory, and meaningful content:

```bash
npx vitest run skills/
```

To test a skill manually, read the SKILL.md and verify the code examples work in a real deck.

## Verify everything before a PR

```bash
npm test                    # 93 tests
npm run lint                # ESLint
npm run format:check        # Prettier
cd packages/runtime && npm run build   # TypeScript compiles cleanly
```
