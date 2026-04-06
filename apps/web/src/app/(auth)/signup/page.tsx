'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          company_name: companyName.trim() || undefined,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/slides')
    }
  }

  const inputClass = 'w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--primary)]">SlideNerds</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">
            Create your account
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">First name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-1">
              Company <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
            </label>
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={inputClass}
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
              minLength={8}
              className={inputClass}
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted-foreground)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--primary)] hover:underline">
            Sign in
          </Link>
        </p>

        <div className="rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
          <p className="text-xs font-semibold text-[var(--foreground)]">Why create an account?</p>
          <ul className="text-xs text-[var(--muted-foreground)] space-y-1.5">
            <li>Save and sync brand configs across all your decks</li>
            <li>Share decks and analytics with your team</li>
            <li>Add live polls, Q&A, and audience reactions</li>
            <li>Per-slide engagement analytics and viewer tracking</li>
            <li>Export to PDF and PowerPoint from the web</li>
          </ul>
          <p className="text-xs text-[var(--muted-foreground)]">
            The runtime and CLI are free and open source. An account is optional.
          </p>
        </div>
      </div>
    </div>
  )
}
