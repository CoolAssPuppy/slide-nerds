import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const validateSchema = z.object({
  token: z.string().min(1),
  value: z.string().min(1),
  type: z.enum(['password', 'email', 'domain']),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = validateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { token, value, type } = parsed.data

  const { data: shareLink } = await supabaseAdmin
    .from('share_links')
    .select('*')
    .eq('token', token)
    .single()

  if (!shareLink) {
    return NextResponse.json({ error: 'Share link not found' }, { status: 404 })
  }

  if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This link has expired' }, { status: 410 })
  }

  switch (type) {
    case 'password': {
      // Simple comparison for now. In production, use bcrypt.
      // The password_hash column stores the hash; here we compare directly
      // since we don't have bcrypt installed yet.
      if (shareLink.password_hash !== value) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 403 })
      }
      break
    }

    case 'email': {
      const allowedEmails = shareLink.allowed_emails ?? []
      if (!allowedEmails.includes(value.toLowerCase())) {
        return NextResponse.json({ error: 'Your email is not on the access list' }, { status: 403 })
      }
      break
    }

    case 'domain': {
      const emailDomain = value.split('@')[1]?.toLowerCase()
      const allowedDomains = shareLink.allowed_domains ?? []
      if (!emailDomain || !allowedDomains.includes(emailDomain)) {
        return NextResponse.json({ error: 'Your email domain is not authorized' }, { status: 403 })
      }
      break
    }
  }

  return NextResponse.json({ granted: true })
}
