'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type ProfileFormProps = {
  displayName: string
  email: string
  plan: string
}

export function ProfileForm({ displayName: initialName, email, plan }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialName)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ display_name: displayName } )
      .eq('id', user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const planLabel = plan === 'pro' ? 'Pro' : plan === 'team' ? 'Team' : 'Free'

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Display name</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="flex-1 h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <button
            onClick={handleSave}
            disabled={saving || displayName === initialName}
            className="px-4 h-10 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saved ? 'Saved' : saving ? 'Saving...' : 'Save'}
          </button>
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
        <label className="block text-sm font-medium mb-1">Plan</label>
        <span className={`inline-block px-3 py-1 rounded-[var(--n-radius-sm)] text-sm font-medium ${
          plan === 'free'
            ? 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            : 'bg-[var(--primary)] text-[var(--primary-foreground)]'
        }`}>
          {planLabel}
        </span>
      </div>
    </div>
  )
}
