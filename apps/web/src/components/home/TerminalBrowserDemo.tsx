'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TerminalWindow } from './TerminalWindow'
import { BrowserWindow } from './BrowserWindow'
import { MockSlidePreview } from './MockSlidePreview'
import { TypedText } from './TypedText'

type Step =
  | 'idle'
  | 'terminal-enter'
  | 'cmd-1'
  | 'cmd-2'
  | 'cmd-3'
  | 'cmd-4'
  | 'cmd-claude'
  | 'claude-ui'
  | 'thinking'
  | 'split-view'

const COMMANDS = [
  'slidenerds create my-talk',
  'cd my-talk',
  'npm install',
  'npm run dev',
]

const CLAUDE_PROMPT =
  'Create a project status slide deck for our Q2 product launch review. Pull the latest data from https://linear.app/acme/project/q2-product-launch'

const TYPING_SPEED = 28
const COMMAND_GAP = 250
const THINKING_DURATION = 2200

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full bg-[#D97757]"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </span>
  )
}

function CompletedLine({ text }: { text: string }) {
  return (
    <div className="flex">
      <span className="text-[var(--primary)] mr-2 select-none">$</span>
      <span>{text}</span>
    </div>
  )
}

function ActiveLine({ text, onComplete }: { text: string; onComplete: () => void }) {
  return (
    <div className="flex">
      <span className="text-[var(--primary)] mr-2 select-none">$</span>
      <TypedText text={text} speed={TYPING_SPEED} onComplete={onComplete} />
    </div>
  )
}

const LATER_STEPS: Step[] = ['cmd-claude', 'claude-ui', 'thinking', 'split-view']
const ALL_CMD_DONE_STEPS: Step[] = [...LATER_STEPS]

export function TerminalBrowserDemo() {
  const [step, setStep] = useState<Step>('idle')
  const triggered = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Start the animation when the component scrolls into view
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true
          setStep('terminal-enter')
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Advance from terminal-enter to first command after fade-in
  useEffect(() => {
    if (step === 'terminal-enter') {
      const t = setTimeout(() => setStep('cmd-1'), 500)
      return () => clearTimeout(t)
    }
    if (step === 'thinking') {
      const t = setTimeout(() => setStep('split-view'), THINKING_DURATION)
      return () => clearTimeout(t)
    }
  }, [step])

  const advanceCmd = (next: Step) => () => {
    setTimeout(() => setStep(next), COMMAND_GAP)
  }

  // Figure out which commands are already typed
  const cmdSteps: Step[] = ['cmd-1', 'cmd-2', 'cmd-3', 'cmd-4']
  const cmdIndex = cmdSteps.indexOf(step)
  const allCmdsDone = ALL_CMD_DONE_STEPS.includes(step)
  const completedCommands = allCmdsDone
    ? COMMANDS
    : cmdIndex > 0
      ? COMMANDS.slice(0, cmdIndex)
      : []

  const isSplit = step === 'split-view'
  const showTerminal = step !== 'idle'
  const showClaudeUI = LATER_STEPS.includes(step)

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto min-h-[420px]">
      <AnimatePresence>
        {showTerminal && (
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <motion.div
              className={isSplit ? 'w-full md:w-1/2' : 'w-full'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              layout
            >
              <TerminalWindow>
                <div className="space-y-1 min-h-[320px]">
                  {completedCommands.map((cmd) => (
                    <CompletedLine key={cmd} text={cmd} />
                  ))}

                  {step === 'cmd-1' && (
                    <ActiveLine text={COMMANDS[0]} onComplete={advanceCmd('cmd-2')} />
                  )}
                  {step === 'cmd-2' && (
                    <ActiveLine text={COMMANDS[1]} onComplete={advanceCmd('cmd-3')} />
                  )}
                  {step === 'cmd-3' && (
                    <ActiveLine text={COMMANDS[2]} onComplete={advanceCmd('cmd-4')} />
                  )}
                  {step === 'cmd-4' && (
                    <ActiveLine text={COMMANDS[3]} onComplete={advanceCmd('cmd-claude')} />
                  )}

                  {step === 'cmd-claude' && (
                    <ActiveLine text="claude" onComplete={() => setTimeout(() => setStep('claude-ui'), 400)} />
                  )}

                  {showClaudeUI && (
                    <>
                      <CompletedLine text="claude" />
                      <div className="mt-3 rounded-[var(--n-radius-md)] border border-[#3d3024] bg-[#1a1410] p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 rounded-full bg-[#D97757] flex items-center justify-center text-[8px] font-bold text-white">
                            C
                          </div>
                          <span className="text-[#D97757] font-bold text-xs">Claude Code</span>
                        </div>
                        <div className="text-xs text-[#a08b7a] mb-2">
                          What would you like to build?
                        </div>
                        {step === 'claude-ui' && (
                          <div className="text-xs leading-relaxed">
                            <TypedText
                              text={CLAUDE_PROMPT}
                              speed={18}
                              onComplete={() => setTimeout(() => setStep('thinking'), 400)}
                            />
                          </div>
                        )}
                        {(step === 'thinking' || step === 'split-view') && (
                          <div className="text-xs leading-relaxed">{CLAUDE_PROMPT}</div>
                        )}
                        {step === 'thinking' && (
                          <div className="mt-3 flex items-center gap-1.5 text-xs text-[#a08b7a]">
                            <span>Thinking</span>
                            <ThinkingDots />
                          </div>
                        )}
                        {step === 'split-view' && (
                          <div className="mt-3 text-xs text-[#D97757] font-medium">
                            Created 4 slides in ./app/page.tsx
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </TerminalWindow>
            </motion.div>

            <AnimatePresence>
              {isSplit && (
                <motion.div
                  className="w-full md:w-1/2"
                  initial={{ opacity: 0, x: 40, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <BrowserWindow url="localhost:3000">
                    <MockSlidePreview />
                  </BrowserWindow>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
