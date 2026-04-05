'use client'

import { Player } from '@remotion/player'
import { SlideComposition } from './SlideComposition'
import { AnalyticsComposition } from './AnalyticsComposition'

type SlidePreviewPlayerProps = {
  variant: 'build' | 'analytics'
}

export function SlidePreviewPlayer({ variant }: SlidePreviewPlayerProps) {
  const Component = variant === 'build' ? SlideComposition : AnalyticsComposition
  const durationInFrames = variant === 'build' ? 150 : 180

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
        durationInFrames={durationInFrames}
        fps={30}
        loop
        autoPlay
        style={{ width: '100%', aspectRatio: '16/9' }}
        controls={false}
      />
    </div>
  )
}
