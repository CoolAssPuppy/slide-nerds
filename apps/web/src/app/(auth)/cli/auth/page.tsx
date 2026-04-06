'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CliAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-[var(--muted-foreground)]">Loading...</p>
      </div>
    }>
      <CliAuthContent />
    </Suspense>
  )
}

function CliAuthContent() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callback')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const redirectToCli = (accessToken: string, refreshToken: string) => {
    if (!callbackUrl) return
    const url = new URL(callbackUrl)
    url.searchParams.set('access_token', accessToken)
    url.searchParams.set('refresh_token', refreshToken)
    setDone(true)
    window.location.href = url.toString()
  }

  useEffect(() => {
    if (!callbackUrl) return

    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const url = new URL(callbackUrl)
        url.searchParams.set('access_token', session.access_token)
        url.searchParams.set('refresh_token', session.refresh_token)
        setDone(true)
        window.location.href = url.toString()
      }
    }
    checkExistingSession()
  }, [callbackUrl, supabase])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      redirectToCli(data.session.access_token, data.session.refresh_token)
    }
  }

  if (!callbackUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--destructive)]">Missing callback</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            This page should be opened by the SlideNerds CLI.
          </p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--primary)]">Logged in</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            You can close this window and return to your terminal.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--primary)]">SlideNerds CLI</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Sign in to connect your terminal
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--destructive)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
