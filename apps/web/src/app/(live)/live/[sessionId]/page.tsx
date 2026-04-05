'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PageProps = {
  params: Promise<{ sessionId: string }>
}

export default function AudiencePage({ params }: PageProps) {
  const [sessionId, setSessionId] = useState<string>('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [deckUrl, setDeckUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'active' | 'ended' | 'error'>('loading')
  const supabase = createClient()

  useEffect(() => {
    params.then(({ sessionId: id }) => setSessionId(id))
  }, [params])

  useEffect(() => {
    if (!sessionId) return

    const loadSession = async () => {
      const resp = await fetch(`/api/live/${sessionId}`)
      if (!resp.ok) { setStatus('error'); return }

      const session = await resp.json()
      if (session.status === 'ended') { setStatus('ended'); return }

      const deck = session.decks
      setDeckUrl(deck?.deployed_url || deck?.url || null)
      setCurrentSlide(session.current_slide || 0)
      setStatus('active')
    }

    loadSession()

    const channel = supabase
      .channel(`live:${sessionId}`)
      .on('broadcast', { event: 'slide_change' }, (payload) => {
        setCurrentSlide(payload.payload.slide ?? 0)
      })
      .on('broadcast', { event: 'session_end' }, () => {
        setStatus('ended')
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId, supabase])

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Joining session...</p>
      </div>
    )
  }

  if (status === 'ended') {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Session ended</h1>
          <p className="text-[var(--muted-foreground)]">The presenter has ended this session.</p>
        </div>
      </div>
    )
  }

  if (status === 'error' || !deckUrl) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Session not found</h1>
          <p className="text-[var(--muted-foreground)]">This live session does not exist or has ended.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen">
      <iframe
        src={`${deckUrl}?slide=${currentSlide + 1}`}
        title="Live presentation"
        className="w-full h-full border-none"
        allow="fullscreen"
      />
    </div>
  )
}
