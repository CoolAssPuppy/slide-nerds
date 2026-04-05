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
  | 'claude-prompt'
  | 'thinking'
  | 'split-view'

const COMMANDS = [
  'npx @strategicnerds/slide-nerds create my-talk',
  'cd my-talk',
  'npm install',
  'npm run dev',
]

const CLAUDE_PROMPT =
  'Create a project status slide deck for our Q2 product launch review. Pull the latest data from https://linear.app/acme/project/q2-product-launch'

const TYPING_SPEED = 30
const COMMAND_GAP = 300
const THINKING_DURATION = 2500

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--primary)]"
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

function PromptLine({ text, onComplete }: { text: string; onComplete: () => void }) {
  return (
    <div className="flex">
      <span className="text-[var(--primary)] mr-2 select-none">$</span>
      <TypedText text={text} speed={TYPING_SPEED} onComplete={onComplete} />
    </div>
  )
}

export function TerminalBrowserDemo() {
  const [step, setStep] = useState<Step>('idle')
  const [hasTriggered, setHasTriggered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setHasTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasTriggered])

  useEffect(() => {
    if (hasTriggered && step === 'idle') {
      setStep('terminal-enter')
      const timeout = setTimeout(() => setStep('cmd-1'), 600)
      return () => clearTimeout(timeout)
    }
  }, [hasTriggered, step])

  useEffect(() => {
    if (step === 'thinking') {
      const timeout = setTimeout(() => setStep('split-view'), THINKING_DURATION)
      return () => clearTimeout(timeout)
    }
  }, [step])

  const completedCommands = (() => {
    const steps: Step[] = ['cmd-1', 'cmd-2', 'cmd-3', 'cmd-4']
    const currentIndex = steps.indexOf(step)
    if (currentIndex < 0) {
      if (['cmd-claude', 'claude-ui', 'claude-prompt', 'thinking', 'split-view'].includes(step)) {
        return COMMANDS
      }
      return []
    }
    return COMMANDS.slice(0, currentIndex)
  })()

  const isSplit = step === 'split-view'
  const showTerminal = step !== 'idle'

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto min-h-[340px]">
      <AnimatePresence>
        {showTerminal && (
          <div className="flex flex-col md:flex-row gap-4">
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                width: isSplit ? '50%' : '100%',
              }}
              transition={{
                opacity: { duration: 0.4 },
                y: { duration: 0.4 },
                width: { duration: 0.6, ease: 'easeInOut' },
              }}
              style={{ minWidth: 0 }}
            >
              <TerminalWindow>
                <div className="space-y-1">
                  {completedCommands.map((cmd) => (
                    <CompletedLine key={cmd} text={cmd} />
                  ))}

                  {step === 'cmd-1' && (
                    <PromptLine text={COMMANDS[0]} onComplete={() => setTimeout(() => setStep('cmd-2'), COMMAND_GAP)} />
                  )}
                  {step === 'cmd-2' && (
                    <PromptLine text={COMMANDS[1]} onComplete={() => setTimeout(() => setStep('cmd-3'), COMMAND_GAP)} />
                  )}
                  {step === 'cmd-3' && (
                    <PromptLine text={COMMANDS[2]} onComplete={() => setTimeout(() => setStep('cmd-4'), COMMAND_GAP)} />
                  )}
                  {step === 'cmd-4' && (
                    <PromptLine text={COMMANDS[3]} onComplete={() => setTimeout(() => setStep('cmd-claude'), COMMAND_GAP)} />
                  )}

                  {step === 'cmd-claude' && (
                    <PromptLine text="claude" onComplete={() => setTimeout(() => setStep('claude-ui'), 400)} />
                  )}

                  {['claude-ui', 'claude-prompt', 'thinking', 'split-view'].includes(step) && (
                    <>
                      <CompletedLine text="claude" />
                      <div className="mt-3 rounded-[var(--n-radius-md)] border border-[var(--border)] bg-[#111] p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[var(--primary)] font-bold text-xs">Claude Code</span>
                          <span className="text-[10px] text-[var(--muted-foreground)]">v1.0</span>
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] mb-2">
                          What would you like to build?
                        </div>
                        {step === 'claude-ui' && (
                          <div className="text-xs">
                            <TypedText
                              text={CLAUDE_PROMPT}
                              speed={20}
                              onComplete={() => setTimeout(() => setStep('thinking'), 500)}
                            />
                          </div>
                        )}
                        {['claude-prompt', 'thinking', 'split-view'].includes(step) && (
                          <div className="text-xs">{CLAUDE_PROMPT}</div>
                        )}
                        {step === 'thinking' && (
                          <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                            Thinking <ThinkingDots />
                          </div>
                        )}
                        {step === 'split-view' && (
                          <div className="mt-2 text-xs text-[var(--primary)]">
                            Done. Created 4 slides.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </TerminalWindow>
            </motion.div>

            {isSplit && (
              <motion.div
                className="w-full md:w-1/2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <BrowserWindow url="localhost:3000">
                  <MockSlidePreview />
                </BrowserWindow>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
