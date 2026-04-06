'use client'

import { Palette } from 'lucide-react'
import type { BrandConfig } from '@/lib/supabase/types'
import { BrandCard } from './BrandCard'
import { EmptyState } from '@/components/shared/EmptyState'

type BrandGridProps = {
  brands: BrandConfig[]
}

export function BrandGrid({ brands }: BrandGridProps) {
  if (brands.length === 0) {
    return (
      <EmptyState
        icon={Palette}
        title="No brand configs yet"
        description="Create a brand to define colors, fonts, and spacing for your presentations."
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {brands.map((brand) => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  )
}
