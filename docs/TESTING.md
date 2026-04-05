# Testing guide and board meeting demo script

This guide focuses on the open source runtime, CLI, and skill system in this repository. It intentionally excludes `apps/`.

## Goal

Run a full end to end test of the experience:

1. User chooses an LLM.
2. User installs slidenerds skills.
3. User and LLM generate an investor pitch deck with chart and animation requirements.
4. User presents in a board meeting using runtime controls and Magic Move style transitions.
5. Team exports the deck for follow up.

## Preconditions

- Node.js 20+
- npm 10+
- Git
- Optional: API access to your preferred LLM

## Container bootstrap for reliable test runs

If you are running inside a CI or sandbox container and installs hang or fail, clear inherited proxy variables before installing dependencies:

```bash
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u npm_config_http_proxy -u npm_config_https_proxy npm ci
```

Then run checks with the same proxy-safe wrapper:

```bash
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u npm_config_http_proxy -u npm_config_https_proxy npm test
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u npm_config_http_proxy -u npm_config_https_proxy npm run lint
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u npm_config_http_proxy -u npm_config_https_proxy npm run build --workspace @slidenerds/runtime
env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u npm_config_http_proxy -u npm_config_https_proxy npm run build --workspace @slidenerds/cli
```

If a previous install was interrupted, remove `node_modules` and re-run `npm ci`.

## Step 1: Verify the baseline repository health

Run these commands from repo root:

```bash
npm install
npm test
npm run lint
npm run build
npm run format:check
```

Expected result:

- Tests pass with no failing suites
- Lint passes with no errors
- Build succeeds for all workspaces
- Formatting check passes

## Step 2: Prepare the demo environment

Build the CLI and runtime packages so you can use the local versions in a realistic flow:

```bash
npm run build --workspace @slidenerds/runtime
npm run build --workspace @slidenerds/cli
```

Create a fresh deck outside this repo:

```bash
node packages/cli/dist/index.js create /tmp/board-meeting-deck
cd /tmp/board-meeting-deck
npm install
```

Expected result:

- Project scaffold exists
- `@slidenerds/runtime` dependency installs
- Next.js app starts cleanly with no warnings from local code

## Step 3: Pick the LLM and skill set

This is the user facing decision point. Keep it simple.

Recommended prompt to the user:

1. Choose your LLM (Claude, ChatGPT, or another model).
2. Install slidenerds skills.
3. Ask the LLM to produce a 10 to 12 slide investor pitch deck.

Skill installation command:

```bash
npx skills add strategicnerds/slidenerds
```

If the user wants only deck creation and no advanced telemetry yet, install these skills first:

- `slidenerds-runtime`
- `deck-templates`
- `layout`
- `slide-types`
- `speaker-notes`
- `brand`

Then add these later if needed:

- `animation`
- `analytics`
- `export`

## Step 4: Generate the pitch deck with a single high quality prompt

Use one concise prompt that drives an elegant workflow:

```text
Create a venture fundraising deck for a seed stage startup called SlideNerds.
Use slidenerds skills and runtime conventions.
Deck must include: title, problem, solution, market size, product demo, business model,
traction, go to market, competition, financial outlook, team, and ask.
Use data-slide for each slide, data-step for progressive reveals, and data-notes for presenter notes.
Keep visual design minimal, high contrast, and boardroom ready.
```

Acceptance criteria:

- Every slide has a clear headline and one core message
- Presenter notes exist for each slide
- At least three slides use step based reveals
- At least two animation types are present: fade and move-up, or fade and scale-in
- At least one chart slide is included and animated on step reveal
- At least one Magic Move style slide pair is included
- Content is concise enough for a 12 minute board presentation

## Step 5: Runtime UX validation checklist

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000` and validate the full board meeting flow:

1. Navigation:
   - Right arrow or space advances steps then slides
   - Left arrow or backspace goes back correctly
2. Presenter mode:
   - Press `P`
   - Confirm notes are visible only in presenter view
   - Confirm timer is visible and increments
3. Light table:
   - Press `L`
   - Confirm all slides are visible and clickable
4. Fullscreen:
   - Press `F` to enter fullscreen
   - Press `Escape` to exit
5. URL sync:
   - Refresh on slide N and confirm slide state persists
6. Animation checks:
   - Verify a fade reveal sequence
   - Verify a move-up or scale-in sequence
   - Verify chart animation runs when chart step appears
   - Verify Magic Move style pair has stable object identity and expected geometry change
7. Media checks:
   - Verify at least one transparent image or logo on dark and light backgrounds
   - Verify logos are readable and brand-safe after treatment

Pass condition: zero console errors and zero broken interactions.

## Step 6: Board meeting simulation script

Pretend you are the founder presenting to the board.

### Presentation run of show

1. Slide 1 to 2 (1 minute): company mission and problem urgency.
2. Slide 3 to 5 (3 minutes): product walkthrough with step reveals plus one fade sequence.
3. Slide 6 to 8 (3 minutes): market, business model, GTM plan, and one animated chart.
4. Slide 9 to 10 (2 minutes): traction, competition, and one Magic Move style transition.
5. Slide 11 to 12 (3 minutes): team, forecast, and fundraising ask.

### Presenter mode rehearsal checklist

- Notes are readable and match spoken narrative
- Timer supports 12 minute pacing
- Step reveals land in the right sequence
- Fade and move-up or scale-in animations both run smoothly
- Magic Move style transition preserves object continuity
- Back navigation recovers cleanly after questions

### Failure drill

During rehearsal, intentionally:

- Jump to light table and return to current slide
- Enter and exit fullscreen mid talk
- Navigate backward through a multi step slide

Expected result: no UI lockups, no state drift, no missing content.

## Step 7: Export validation

From the deck directory, run:

```bash
node /workspace/slide-nerds/packages/cli/dist/index.js export --pdf --url http://localhost:3000
node /workspace/slide-nerds/packages/cli/dist/index.js export --pptx --url http://localhost:3000
```

Expected result:

- Export files are created successfully
- Slide order and visible content match runtime output

## Step 8: Sign off criteria for startup demo readiness

The project is demo ready when all are true:

- Repository tests, lint, build, and format checks pass
- Deck generation flow works with chosen LLM and skills
- Runtime controls all work in one uninterrupted rehearsal
- Presenter notes, chart animation, and step reveals are reliable
- Two animation types and one Magic Move style sequence work correctly
- Export artifacts are generated for investor follow up

If any item fails, log exact command output and fix before board presentation day.
