'use client'

import { Player } from '@remotion/player'
import { SlideComposition } from './SlideComposition'
import { AnalyticsComposition } from './AnalyticsComposition'
import { LivePollComposition } from './LivePollComposition'

type SlidePreviewPlayerProps = {
  variant: 'build' | 'analytics' | 'live'
}

const VARIANTS = {
  build: { component: SlideComposition, duration: 150 },
  analytics: { component: AnalyticsComposition, duration: 180 },
  live: { component: LivePollComposition, duration: 210 },
} as const

export function SlidePreviewPlayer({ variant }: SlidePreviewPlayerProps) {
  const { component: Component, duration } = VARIANTS[variant]

  return (
    <div style={{
      borderRadius: 'var(--n-radius-xl, 16px)',
      overflow: 'hidden',
      border: '1px solid var(--border)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    }}>
      <Player
        component={Component}
        compositionWidth={960}
        compositionHeight={540}
        durationInFrames={duration}
        fps={30}
        loop
        autoPlay
        style={{ width: '100%', aspectRatio: '16/9' }}
        controls={false}
        acknowledgeRemotionLicense
      />
    </div>
  )
}
