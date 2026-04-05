import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { checkDeckAccess } from '@/lib/deck-access'

type RouteContext = {
  params: Promise<{ deckId: string; path: string[] }>
}

const MIME_TYPES: Record<string, string> = {
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  mjs: 'application/javascript',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  ico: 'image/x-icon',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  eot: 'application/vnd.ms-fontobject',
  mp4: 'video/mp4',
  webm: 'video/webm',
  txt: 'text/plain',
  xml: 'application/xml',
  map: 'application/json',
}

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  return MIME_TYPES[ext] ?? 'application/octet-stream'
}

function getCacheControl(filePath: string): string {
  if (/\.[a-f0-9]{8,}\.(js|css|mjs)$/i.test(filePath)) {
    return 'public, max-age=31536000, immutable'
  }
  if (filePath.endsWith('.html')) {
    return 'public, max-age=0, must-revalidate'
  }
  return 'public, max-age=3600'
}

export async function GET(request: Request, context: RouteContext) {
  const { deckId, path } = await context.params
  const filePath = path.join('/')

  const url = new URL(request.url)
  const shareToken = url.searchParams.get('token')

  let userId: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {
    // No authenticated session -- that's fine for public decks and share tokens
  }

  const { access, deck } = await checkDeckAccess({
    adminClient: supabaseAdmin,
    deckId,
    userId,
    shareToken,
  })

  if (!access.granted) {
    const status = access.reason === 'not_found' ? 404 : 403
    return NextResponse.json({ error: access.reason }, { status })
  }

  if (!deck?.bundle_path) {
    return NextResponse.json({ error: 'Deck not uploaded' }, { status: 404 })
  }

  const storagePath = `${deck.bundle_path}/${filePath}`

  const { data, error } = await supabaseAdmin.storage
    .from('deck-bundles')
    .download(storagePath)

  if (error || !data) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const contentType = getContentType(filePath)
  const cacheControl = getCacheControl(filePath)
  let arrayBuffer = await data.arrayBuffer()

  // Rewrite absolute asset paths in HTML so they resolve relative to this
  // endpoint. When a share token is present, append it so sub-resources
  // (CSS, JS, images) also pass auth.
  if (filePath.endsWith('.html')) {
    const html = new TextDecoder().decode(arrayBuffer)
    const qs = shareToken ? `?token=${shareToken}` : ''
    const rewritten = html
      .replace(/(href|src)="\/([^"]*?)"/g, (_match, attr, path) => `${attr}="./${path}${qs}"`)
      .replace(/(href|src)='\/([^']*?)'/g, (_match, attr, path) => `${attr}='./${path}${qs}'`)
    arrayBuffer = new TextEncoder().encode(rewritten).buffer as ArrayBuffer
  }

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors 'self' *.slidenerds.com",
    },
  })
}
