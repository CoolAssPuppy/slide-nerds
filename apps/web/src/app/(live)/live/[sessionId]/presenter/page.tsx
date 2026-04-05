'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PageProps = {
  params: Promise<{ sessionId: string }>
}

export default function PresenterPage({ params }: PageProps) {
  const [sessionId, setSessionId] = useState<string>('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [deckUrl, setDeckUrl] = useState<string | null>(null)
  const [deckName, setDeckName] = useState('')
  const [audienceCount, setAudienceCount] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    params.then(({ sessionId: id }) => setSessionId(id))
  }, [params])

  useEffect(() => {
    if (!sessionId) return

    const loadSession = async () => {
      const resp = await fetch(`/api/live/${sessionId}`)
      if (!resp.ok) return
      const session = await resp.json()
      const deck = session.decks
      setDeckUrl(deck?.deployed_url || deck?.url || null)
      setDeckName(deck?.name || 'Presentation')
      setCurrentSlide(session.current_slide || 0)
    }

    loadSession()

    const timer = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(timer)
  }, [sessionId])

  const broadcast = (slide: number) => {
    supabase.channel(`live:${sessionId}`).send({
      type: 'broadcast',
      event: 'slide_change',
      payload: { slide },
    })
  }

  const nextSlide = () => {
    const next = currentSlide + 1
    setCurrentSlide(next)
    broadcast(next)
  }

  const prevSlide = () => {
    const prev = Math.max(0, currentSlide - 1)
    setCurrentSlide(prev)
    broadcast(prev)
  }

  const endSession = async () => {
    await fetch(`/api/live/${sessionId}`, { method: 'DELETE' })
    supabase.channel(`live:${sessionId}`).send({
      type: 'broadcast',
      event: 'session_end',
      payload: {},
    })
    window.close()
  }

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  return (
    <div className="h-screen flex flex-col bg-[var(--background)]">
      <header className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold">{deckName}</h1>
          <span className="text-sm text-[var(--muted-foreground)]">
            Slide {currentSlide + 1}
          </span>
          <span className="text-sm font-mono text-[var(--muted-foreground)]">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
            {audienceCount} watching
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="px-3 py-1.5 text-sm rounded-[var(--n-radius-md)] border border-[var(--border)] hover:bg-[var(--accent)]"
          >
            Previous
          </button>
          <button
            onClick={nextSlide}
            className="px-3 py-1.5 text-sm rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)]"
          >
            Next
          </button>
          <button
            onClick={endSession}
            className="px-3 py-1.5 text-sm rounded-[var(--n-radius-md)] border border-[var(--destructive)] text-[var(--destructive)] hover:bg-[var(--destructive)] hover:text-[var(--destructive-foreground)]"
          >
            End
          </button>
        </div>
      </header>

      <main className="flex-1 p-4">
        {deckUrl ? (
          <iframe
            src={`${deckUrl}?slide=${currentSlide + 1}`}
            title="Presenter view"
            className="w-full h-full border border-[var(--border)] rounded-[var(--n-radius-lg)]"
            allow="fullscreen"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-[var(--muted-foreground)]">
            No deck URL configured
          </div>
        )}
      </main>
    </div>
  )
}
