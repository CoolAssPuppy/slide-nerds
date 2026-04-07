export const FPS = 30
export const CHARS_PER_FRAME = 1.5

// Colors
export const ACCENT = '#3ECF8E'
export const BG = '#0f0f0f'
export const SURFACE = '#1a1a1f'
export const TEXT_COLOR = '#e8e6e3'
export const MUTED = '#666'
export const DIM = '#444'
export const BORDER_COLOR = 'rgba(255,255,255,0.06)'
export const CLAUDE_ORANGE = '#D97757'
export const CLAUDE_BG = '#1a1410'
export const CLAUDE_BORDER = '#3d3024'

// CLI commands typed into terminal
export const COMMANDS = [
  'slidenerds create my-talk',
  'cd my-talk',
  'npm install',
  'npm run dev',
]

// Claude interactions
export type SlideView = 'initial' | 'magic-move' | 'light-table' | 'step-anim' | 'cta'

export type Interaction = {
  prompt: string
  result: string
  slideState: SlideView
}

export const INTERACTIONS: readonly Interaction[] = [
  {
    prompt: 'Create a product launch deck for Q2. Pull the latest status from https://linear.app/acme/project/q2-launch and build slides from it.',
    result: 'Created 6 slides in ./app/page.tsx',
    slideState: 'initial',
  },
  {
    prompt: 'Add a Magic Move transition between the metrics slide and the team slide. Animate the revenue number.',
    result: 'Added data-magic-id to revenue element on slides 4 and 5',
    slideState: 'magic-move',
  },
  {
    prompt: 'Show all slides in light table view so I can see the flow. Reorder the problem slide before the solution.',
    result: 'Reordered slides: problem now at position 2, solution at 3',
    slideState: 'light-table',
  },
  {
    prompt: 'Add step animations to the metrics cards. Each card should fade in one at a time when I advance.',
    result: 'Added data-step and step-fade to 3 metric cards on slide 4',
    slideState: 'step-anim',
  },
]

// Pure helper: get typed text substring based on frame
export const getTypedText = (
  text: string,
  startFrame: number,
  currentFrame: number,
): { display: string; complete: boolean } => {
  const elapsed = Math.max(0, currentFrame - startFrame)
  const charCount = Math.min(text.length, Math.floor(elapsed * CHARS_PER_FRAME))
  return { display: text.slice(0, charCount), complete: charCount >= text.length }
}

// Frame at which typing completes for a given text
export const typingEndFrame = (text: string, startFrame: number): number =>
  startFrame + Math.ceil(text.length / CHARS_PER_FRAME)

// Frame timeline -- all values are absolute frame numbers at 30fps
const CMD_GAP = 8 // frames between commands

export const TERMINAL_ENTER = 0
export const CMD_1_START = 15
export const CMD_2_START = typingEndFrame(COMMANDS[0], CMD_1_START) + CMD_GAP
export const CMD_3_START = typingEndFrame(COMMANDS[1], CMD_2_START) + CMD_GAP
export const CMD_4_START = typingEndFrame(COMMANDS[2], CMD_3_START) + CMD_GAP
export const CMD_CLAUDE_START = typingEndFrame(COMMANDS[3], CMD_4_START) + CMD_GAP
export const CLAUDE_UI_START = typingEndFrame('claude', CMD_CLAUDE_START) + 12

// Interaction timings
const THINKING_DURATION = 54 // frames (~1.8s)
const PAUSE_AFTER_DONE = 75 // frames (~2.5s)

const buildInteractionFrames = (promptStart: number, promptText: string) => {
  const thinkingStart = typingEndFrame(promptText, promptStart) + 12
  const doneStart = thinkingStart + THINKING_DURATION
  return { promptStart, thinkingStart, doneStart }
}

export const INTERACTION_FRAMES = (() => {
  const i0 = buildInteractionFrames(CLAUDE_UI_START + 8, INTERACTIONS[0].prompt)
  const i1 = buildInteractionFrames(i0.doneStart + PAUSE_AFTER_DONE, INTERACTIONS[1].prompt)
  const i2 = buildInteractionFrames(i1.doneStart + PAUSE_AFTER_DONE, INTERACTIONS[2].prompt)
  const i3 = buildInteractionFrames(i2.doneStart + PAUSE_AFTER_DONE, INTERACTIONS[3].prompt)
  return [i0, i1, i2, i3] as const
})()

export const SPLIT_START = INTERACTION_FRAMES[0].doneStart

// IDE phase: editor window appears, user types code, browser updates
export const IDE_CODE_CHARS_PER_FRAME = 1.2 // slightly slower for code readability

export const EDITOR_CODE = `<Slide>
  <h1 className="text-6xl font-bold">
    Ready to ship?
  </h1>
  <p className="text-xl text-muted">
    Start building with SlideNerds today.
  </p>
  <div className="flex gap-4 mt-8">
    <Button variant="primary">
      Get started
    </Button>
    <Button variant="ghost">
      View docs
    </Button>
  </div>
</Slide>`

export const IDE_START = INTERACTION_FRAMES[3].doneStart + PAUSE_AFTER_DONE + 15
export const IDE_TYPING_START = IDE_START + 20 // pause before typing begins

export const ideTypingEndFrame = (): number =>
  IDE_TYPING_START + Math.ceil(EDITOR_CODE.length / IDE_CODE_CHARS_PER_FRAME)

export const IDE_SLIDE_APPEAR = ideTypingEndFrame() + 15 // browser updates after code is typed

// Fade out starts 15 frames before end, fade in is first 15 frames
export const FADE_FRAMES = 15

export const TOTAL_DURATION = IDE_SLIDE_APPEAR + 90 + FADE_FRAMES // hold the CTA slide for ~3s before loop
