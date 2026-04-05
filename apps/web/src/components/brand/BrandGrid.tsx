'use client'

import { Palette } from 'lucide-react'
import type { BrandConfig } from '@/lib/supabase/types'
import { BrandCard } from './BrandCard'

type BrandGridProps = {
  brands: BrandConfig[]
}

export function BrandGrid({ brands }: BrandGridProps) {
  if (brands.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {brands.map((brand) => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-[var(--muted)] flex items-center justify-center mb-4">
        <Palette size={24} className="text-[var(--muted-foreground)]" />
      </div>
      <h3 className="text-lg font-semibold">No brand configs yet</h3>
      <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-sm">
        Create a brand configuration to define colors, fonts, and spacing for your presentations.
      </p>
    </div>
  )
}
