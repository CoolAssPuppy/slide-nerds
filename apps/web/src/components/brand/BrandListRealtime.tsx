'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BrandGrid } from './BrandGrid'
import type { BrandConfig } from '@/lib/supabase/types'

type BrandListRealtimeProps = {
  initialBrands: BrandConfig[]
  userId: string
}

export function BrandListRealtime({ initialBrands, userId }: BrandListRealtimeProps) {
  const [brands, setBrands] = useState(initialBrands)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setBrands(initialBrands)
  }, [initialBrands])

  useEffect(() => {
    const channel = supabase
      .channel('brand-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'brand_configs',
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          setBrands((prev) => [payload.new as BrandConfig, ...prev])
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'brand_configs',
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id
          setBrands((prev) => prev.filter((b) => b.id !== deletedId))
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'brand_configs',
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as BrandConfig
          setBrands((prev) =>
            prev.map((b) => (b.id === updated.id ? updated : b)),
          )
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  return <BrandGrid brands={brands} />
}
