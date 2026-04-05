import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan, getUploadSizeLimit, formatBytes } from '@/lib/tier'
import JSZip from 'jszip'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, context: RouteContext) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: deckId } = await context.params

  // Verify deck ownership
  const { data: deck } = await supabase
    .from('decks')
    .select('id, owner_id, version')
    .eq('id', deckId)
    .single()

  if (!deck) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
  }

  if (deck.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Check tier limits
  const plan = await getUserPlan(supabase, user.id)
  const sizeLimit = getUploadSizeLimit(plan)

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded. Send a zip file as "file" in multipart form data.' }, { status: 400 })
  }

  if (file.size > sizeLimit) {
    return NextResponse.json(
      { error: `File too large (${formatBytes(file.size)}). Your plan allows up to ${formatBytes(sizeLimit)}.` },
      { status: 413 }
    )
  }

  // Extract zip and validate contents
  const buffer = await file.arrayBuffer()
  let zip: JSZip

  try {
    zip = await JSZip.loadAsync(buffer)
  } catch {
    return NextResponse.json({ error: 'Invalid zip file.' }, { status: 400 })
  }

  // Check for index.html
  const hasIndex = zip.file('index.html') !== null
  if (!hasIndex) {
    return NextResponse.json(
      { error: 'Zip must contain index.html at the root. Build with `output: "export"` in next.config.' },
      { status: 400 }
    )
  }

  // Validate file count (prevent zip bombs)
  const fileCount = Object.keys(zip.files).filter(name => !zip.files[name].dir).length
  if (fileCount > 1000) {
    return NextResponse.json({ error: 'Too many files in zip (max 1000).' }, { status: 400 })
  }

  const newVersion = (deck.version ?? 0) + 1
  const basePath = `${user.id}/${deckId}/${newVersion}`

  // Extract and upload each file individually to Supabase Storage
  const fileEntries = Object.entries(zip.files).filter(([_, entry]) => !entry.dir)
  let uploadedBytes = 0

  for (const [filePath, entry] of fileEntries) {
    // Security: prevent path traversal
    if (filePath.includes('..') || filePath.startsWith('/')) continue

    const content = await entry.async('arraybuffer')
    const storagePath = `${basePath}/${filePath}`

    const contentType = guessContentType(filePath)

    const { error: uploadError } = await supabase.storage
      .from('deck-bundles')
      .upload(storagePath, content, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      console.error(`Failed to upload ${filePath}: ${uploadError.message}`)
    }

    uploadedBytes += content.byteLength
  }

  // Update the deck record
  const { data: updatedDeck, error: updateError } = await supabase
    .from('decks')
    .update({
      bundle_path: basePath,
      bundle_size_bytes: uploadedBytes,
      source_type: 'push',
      version: newVersion,
    })
    .eq('id', deckId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json(
      { error: `Failed to update deck: ${updateError.message}` },
      { status: 500 }
    )
  }

  // Create a version history entry
  await supabase
    .from('deck_versions')
    .insert({
      deck_id: deckId,
      version: newVersion,
      snapshot: {
        bundle_path: basePath,
        bundle_size_bytes: uploadedBytes,
        file_count: fileEntries.length,
        uploaded_at: new Date().toISOString(),
      },
    })

  return NextResponse.json({
    deck: updatedDeck,
    version: newVersion,
    bundle_path: basePath,
    files_uploaded: fileEntries.length,
  })
}

function guessContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  const types: Record<string, string> = {
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
    txt: 'text/plain',
    xml: 'application/xml',
    map: 'application/json',
  }
  return types[ext] ?? 'application/octet-stream'
}
