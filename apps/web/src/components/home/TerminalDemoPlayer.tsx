'use client'

import { Player } from '@remotion/player'

import { TerminalDemoComposition } from './terminal-demo/TerminalDemoComposition'
import { TOTAL_DURATION, FPS } from './terminal-demo/constants'

export function TerminalDemoPlayer() {
  return (
    <div style={{
      borderRadius: 'var(--n-radius-xl, 16px)',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    }}>
      <Player
        component={TerminalDemoComposition}
        compositionWidth={960}
        compositionHeight={540}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        loop
        autoPlay
        style={{ width: '100%', aspectRatio: '16/9' }}
        controls={false}
        acknowledgeRemotionLicense
      />
    </div>
  )
}
