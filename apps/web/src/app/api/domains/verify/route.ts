import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import dns from 'dns/promises'

const verifySchema = z.object({
  id: z.string().uuid(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = verifySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { data: domain } = await supabase
    .from('custom_domains')
    .select('*')
    .eq('id', parsed.data.id)
    .single()

  if (!domain) {
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
  }

  // Check for TXT record verification
  // User must add a TXT record: _slidenerds-verify.domain.com -> verification_token
  try {
    const records = await dns.resolveTxt(`_slidenerds-verify.${domain.domain}`)
    const flatRecords = records.map(r => r.join(''))
    const isVerified = flatRecords.includes(domain.verification_token)

    if (isVerified) {
      await supabase
        .from('custom_domains')
        .update({ is_verified: true, ssl_status: 'active' })
        .eq('id', domain.id)

      return NextResponse.json({ verified: true })
    }

    return NextResponse.json({
      verified: false,
      message: `Add a TXT record for _slidenerds-verify.${domain.domain} with value: ${domain.verification_token}`,
    })
  } catch {
    return NextResponse.json({
      verified: false,
      message: `No TXT record found. Add _slidenerds-verify.${domain.domain} with value: ${domain.verification_token}`,
    })
  }
}
