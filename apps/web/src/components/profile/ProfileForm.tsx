'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ProfileFormProps = {
  firstName: string
  lastName: string
  companyName: string
  email: string
  plan: string
}

export function ProfileForm({ firstName: initFirst, lastName: initLast, companyName: initCompany, email, plan }: ProfileFormProps) {
  const [firstName, setFirstName] = useState(initFirst)
  const [lastName, setLastName] = useState(initLast)
  const [companyName, setCompanyName] = useState(initCompany)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const isDirty = firstName !== initFirst || lastName !== initLast || companyName !== initCompany

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const displayName = `${firstName.trim()} ${lastName.trim()}`.trim()

    await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        company_name: companyName.trim() || null,
        display_name: displayName,
      })
      .eq('id', user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const inputClass = 'w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'
  const planLabel = plan === 'pro' ? 'Pro' : plan === 'team' ? 'Team' : 'Free'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">First name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--muted)] text-sm text-[var(--muted-foreground)] cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Company <span className="text-[var(--muted-foreground)] font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Plan</label>
        <span className={`inline-block px-3 py-1 rounded-[var(--n-radius-sm)] text-sm font-medium ${
          plan === 'free'
            ? 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            : 'bg-[var(--primary)] text-[var(--primary-foreground)]'
        }`}>
          {planLabel}
        </span>
      </div>

      {isDirty && (
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 h-10 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saved ? 'Saved' : saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}
    </div>
  )
}
