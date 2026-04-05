'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/lib/supabase/database.types'
import { DEFAULT_BRAND_CONFIG } from '@/lib/brand'
import type { BrandConfigData } from '@/lib/brand'

type NewBrandDialogProps = {
  onClose: () => void
}

const COLOR_FIELDS = [
  { key: 'primary' as const, label: 'Primary' },
  { key: 'accent' as const, label: 'Accent' },
  { key: 'background' as const, label: 'Background' },
  { key: 'surface' as const, label: 'Surface' },
  { key: 'text' as const, label: 'Text' },
]

export function NewBrandDialog({ onClose }: NewBrandDialogProps) {
  const [name, setName] = useState('')
  const [config, setConfig] = useState<BrandConfigData>(DEFAULT_BRAND_CONFIG)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const updateColor = (key: keyof BrandConfigData['colors'], value: string) => {
    setConfig({
      ...config,
      colors: { ...config.colors, [key]: value },
    })
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('brand_configs')
      .insert({
        name: name.trim(),
        owner_id: user.id,
        config: config as unknown as Json,
      })
      .select('id')
      .single()

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/brand/${data.id}`)
  }

  const inputClass =
    'w-full h-10 px-3 rounded-[var(--n-radius-md)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[var(--n-radius-xl)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">New brand</h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="brand-name" className="block text-sm font-medium mb-1">
              Brand name
            </label>
            <input
              id="brand-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Acme Corp"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Colors</label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex flex-col items-center gap-1">
                  <label
                    htmlFor={`color-${key}`}
                    className="relative w-10 h-10 rounded-[var(--n-radius-md)] border border-[var(--border)] overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--ring)] transition-shadow"
                    style={{ backgroundColor: config.colors[key] }}
                  >
                    <input
                      id={`color-${key}`}
                      type="color"
                      value={config.colors[key]}
                      onChange={(e) => updateColor(key, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-[var(--destructive)]">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[var(--n-radius-md)] text-sm hover:bg-[var(--accent)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
