'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'
import { NewBrandDialog } from './NewBrandDialog'

export function BrandPageHeader() {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold">Brand</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Color palettes, fonts, and spacing for your presentations.
        </p>
      </div>
      <button
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-[var(--n-radius-md)] bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium hover:opacity-90 transition-opacity"
      >
        <Palette size={16} />
        New brand
      </button>
      {showDialog && <NewBrandDialog onClose={() => setShowDialog(false)} />}
    </div>
  )
}
