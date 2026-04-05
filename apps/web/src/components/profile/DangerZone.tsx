'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function DangerZone() {
  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (confirmText !== 'delete my account') return

    await supabase.auth.signOut()
    router.push('/')
  }

  if (!confirming) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Delete account</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Permanently delete your account and all decks. This cannot be undone.
          </p>
        </div>
        <button
          onClick={() => setConfirming(true)}
          className="px-4 py-2 rounded-[var(--n-radius-md)] border border-[var(--destructive)] text-[var(--destructive)] text-sm font-medium hover:bg-[var(--destructive)] hover:text-[var(--destructive-foreground)] transition-colors"
        >
          Delete account
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm">
        Type <strong>delete my account</strong> to confirm.
      </p>
      <input
        type="text"
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="delete my account"
        className="w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--destructive)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--destructive)]"
      />
      <div className="flex gap-2">
        <button
          onClick={() => { setConfirming(false); setConfirmText('') }}
          className="px-4 py-2 rounded-[var(--n-radius-md)] text-sm hover:bg-[var(--accent)] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={confirmText !== 'delete my account'}
          className="px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--destructive)] text-[var(--destructive-foreground)] text-sm font-medium disabled:opacity-50 transition-opacity"
        >
          Permanently delete
        </button>
      </div>
    </div>
  )
}
