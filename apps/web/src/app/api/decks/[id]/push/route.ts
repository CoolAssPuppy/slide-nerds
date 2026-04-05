import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserPlan, getUploadSizeLimit, formatBytes } from '@/lib/tier'

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

  // Read the file as an ArrayBuffer for upload
  const buffer = await file.arrayBuffer()
  const newVersion = (deck.version ?? 0) + 1
  const bundlePath = `${user.id}/${deckId}/${newVersion}.zip`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('deck-bundles')
    .upload(bundlePath, buffer, {
      contentType: 'application/zip',
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 }
    )
  }

  // Update the deck record
  const { data: updatedDeck, error: updateError } = await supabase
    .from('decks')
    .update({
      bundle_path: bundlePath,
      bundle_size_bytes: file.size,
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
        bundle_path: bundlePath,
        bundle_size_bytes: file.size,
        uploaded_at: new Date().toISOString(),
      },
    })

  return NextResponse.json({
    deck: updatedDeck,
    version: newVersion,
    bundle_path: bundlePath,
  })
}
