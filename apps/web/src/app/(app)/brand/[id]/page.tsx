import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { BrandConfig } from '@/lib/supabase/types'
import { BrandEditor } from '@/components/brand/BrandEditor'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('brand_configs')
    .select('*')
    .eq('id', id)
    .single()

  const brand = data as BrandConfig | null
  if (!brand) notFound()

  return <BrandEditor brand={brand} />
}
