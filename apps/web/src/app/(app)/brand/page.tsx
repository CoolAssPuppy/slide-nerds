import { createClient } from '@/lib/supabase/server'
import { BrandListRealtime } from '@/components/brand/BrandListRealtime'
import { BrandGrid } from '@/components/brand/BrandGrid'
import { BrandPageHeader } from '@/components/brand/BrandPageHeader'
import type { BrandConfig } from '@/lib/supabase/types'

export const metadata = { title: 'Brand' }

export default async function BrandPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: ownData } = await supabase
    .from('brand_configs')
    .select('*')
    .eq('owner_id', user!.id)
    .order('updated_at', { ascending: false })
  const ownBrands = (ownData ?? []) as BrandConfig[]

  const { data: memberData } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user!.id)
  const teamIds = (memberData ?? []).map((m) => m.team_id)

  let teamBrands: BrandConfig[] = []
  if (teamIds.length > 0) {
    const { data: teamData } = await supabase
      .from('brand_configs')
      .select('*')
      .in('team_id', teamIds)
      .order('updated_at', { ascending: false })
    teamBrands = (teamData ?? []) as BrandConfig[]
  }

  const ownIds = new Set(ownBrands.map((b) => b.id))
  const filteredTeamBrands = teamBrands.filter((b) => !ownIds.has(b.id))

  return (
    <div>
      <BrandPageHeader />

      {ownBrands.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            My brands
          </h2>
          <BrandListRealtime initialBrands={ownBrands} userId={user!.id} />
        </div>
      )}

      {ownBrands.length === 0 && filteredTeamBrands.length === 0 && (
        <BrandGrid brands={[]} />
      )}

      {filteredTeamBrands.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
            Team brands
          </h2>
          <BrandGrid brands={filteredTeamBrands} />
        </div>
      )}
    </div>
  )
}
