'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthLayout } from '@/components/auth/AuthLayout'

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
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
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
        redirectToCli(session.access_token, session.refresh_token)
      }
    }
    checkExistingSession()
  }, [callbackUrl, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.session) redirectToCli(data.session.access_token, data.session.refresh_token)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, first_name: firstName.trim(), last_name: lastName.trim() } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    if (data.session) {
      redirectToCli(data.session.access_token, data.session.refresh_token)
    } else {
      setError('Check your email to confirm your account, then run slidenerds login again.')
      setLoading(false)
    }
  }

  if (!callbackUrl) {
    return (
      <AuthLayout>
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold text-[var(--destructive)]">Missing callback</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">This page should be opened by the SlideNerds CLI.</p>
        </div>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold text-[var(--primary)]">Logged in</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">You can close this window and return to your terminal.</p>
        </div>
      </AuthLayout>
    )
  }

  const inputClass = 'w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-bold">{mode === 'login' ? 'Connect your terminal' : 'Create your account'}</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">{mode === 'login' ? 'Sign in to link the SlideNerds CLI' : 'Get started with SlideNerds'}</p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
            </div>
            {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
            <button type="submit" disabled={loading} className="w-full h-10 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">First name</label>
                <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className={inputClass} />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last name</label>
                <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="signupEmail" className="block text-sm font-medium mb-1">Email</label>
              <input id="signupEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="signupPassword" className="block text-sm font-medium mb-1">Password</label>
              <input id="signupPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className={inputClass} />
            </div>
            {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}
            <button type="submit" disabled={loading} className="w-full h-10 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        )}

        <p className="text-center lg:text-left text-sm text-[var(--muted-foreground)]">
          {mode === 'login' ? (
            <>No account? <button onClick={() => { setMode('signup'); setError(null) }} className="text-[var(--primary)] hover:underline">Create one</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setMode('login'); setError(null) }} className="text-[var(--primary)] hover:underline">Sign in</button></>
          )}
        </p>
      </div>
    </AuthLayout>
  )
}
