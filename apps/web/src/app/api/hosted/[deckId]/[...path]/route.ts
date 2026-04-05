import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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
  // Hashed assets (JS/CSS bundles) can be cached forever
  if (/\.[a-f0-9]{8,}\.(js|css|mjs)$/i.test(filePath)) {
    return 'public, max-age=31536000, immutable'
  }
  // HTML files should revalidate
  if (filePath.endsWith('.html')) {
    return 'public, max-age=0, must-revalidate'
  }
  // Everything else: cache for 1 hour
  return 'public, max-age=3600'
}

export async function GET(_request: Request, context: RouteContext) {
  const { deckId, path } = await context.params
  const filePath = path.join('/')

  // Look up the deck to find its bundle path
  const { data: deck } = await supabaseAdmin
    .from('decks')
    .select('bundle_path, is_public, owner_id, version')
    .eq('id', deckId)
    .single()

  if (!deck?.bundle_path) {
    return NextResponse.json({ error: 'Deck not found or not uploaded' }, { status: 404 })
  }

  // Access control is handled by the viewer page (auth gates before iframe embed)
  // bundle_path is now the extracted directory, not a zip file
  const storagePath = `${deck.bundle_path}/${filePath}`

  const { data, error } = await supabaseAdmin.storage
    .from('deck-bundles')
    .download(storagePath)

  if (error || !data) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const contentType = getContentType(filePath)
  const cacheControl = getCacheControl(filePath)
  const arrayBuffer = await data.arrayBuffer()

  return new NextResponse(arrayBuffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors 'self' *.slidenerds.com",
    },
  })
}
