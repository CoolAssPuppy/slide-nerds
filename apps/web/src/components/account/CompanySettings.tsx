'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building2 } from 'lucide-react'

type CompanySettingsProps = {
  companyName: string
  userId: string
}

export function CompanySettings({ companyName: initialName, userId }: CompanySettingsProps) {
  const [companyName, setCompanyName] = useState(initialName)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const isDirty = companyName !== initialName

  const handleSave = async () => {
    setSaving(true)
    await supabase
      .from('profiles')
      .update({ company_name: companyName.trim() || null })
      .eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    router.refresh()
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const ext = file.name.split('.').pop() ?? 'png'
    const path = `${userId}/company-logo.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      setLogoUrl(publicUrl)
    }
    setUploading(false)
  }

  const inputClass = 'w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div
          onClick={() => fileRef.current?.click()}
          className="w-16 h-16 rounded-[var(--n-radius-md)] border-2 border-dashed border-[var(--border)] flex items-center justify-center cursor-pointer hover:border-[var(--primary)] transition-colors shrink-0 overflow-hidden"
        >
          {logoUrl ? (
            <img src={logoUrl} alt="Company logo" className="w-full h-full object-cover" />
          ) : (
            <Building2 className="w-6 h-6 text-[var(--muted-foreground)]" />
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Company name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Corp"
            className={inputClass}
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            {uploading ? 'Uploading logo...' : 'Click the icon to upload your company logo.'}
          </p>
        </div>
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
