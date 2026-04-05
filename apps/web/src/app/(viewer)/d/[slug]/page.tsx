import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Deck } from '@/lib/supabase/types'
import { AccessGate } from '@/components/viewer/AccessGate'
import { ViewTracker } from '@/components/viewer/ViewTracker'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ token?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: deck } = await supabase
    .from('decks')
    .select('name, description, thumbnail_url')
    .eq('slug', slug)
    .single()

  if (!deck) return { title: 'Not found' }

  return {
    title: deck.name,
    description: deck.description ?? `${deck.name} - hosted on SlideNerds`,
    openGraph: {
      title: deck.name,
      description: deck.description ?? undefined,
      images: deck.thumbnail_url ? [deck.thumbnail_url] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: deck.name,
      description: deck.description ?? undefined,
      images: deck.thumbnail_url ? [deck.thumbnail_url] : undefined,
    },
  }
}

export default async function DeckViewerPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { token } = await searchParams
  const supabase = await createClient()

  const { data: deckData } = await supabase
    .from('decks')
    .select('*')
    .eq('slug', slug)
    .single()

  const deck = deckData as Deck | null
  if (!deck) notFound()

  // Check if the deck is private and requires access control
  if (!deck.is_public) {
    // Check if the current user is the owner
    const { data: { user } } = await supabase.auth.getUser()
    const isOwner = user?.id === deck.owner_id

    if (!isOwner) {
      // Check for a valid share link token
      if (token) {
        const { data: shareLink } = await supabase
          .from('share_links')
          .select('*')
          .eq('token', token)
          .eq('deck_id', deck.id)
          .single()

        if (!shareLink) {
          return <PrivateMessage />
        }

        // Check expiration
        if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
          return (
            <CenteredMessage
              title="Link expired"
              description="This share link has expired. Ask the deck owner for a new one."
            />
          )
        }

        // For password/email/domain access types, show the access gate
        if (shareLink.access_type !== 'public') {
          return (
            <AccessGate
              shareLink={shareLink}
              deckName={deck.name}
            >
              <DeckViewer deck={deck} shareToken={token} />
            </AccessGate>
          )
        }
      } else {
        return <PrivateMessage />
      }
    }
  }

  return <DeckViewer deck={deck} shareToken={token} />
}

function DeckViewer({ deck, shareToken }: { deck: Deck; shareToken?: string }) {
  // Hosted content (uploaded bundle) takes priority over external URL
  const hostedUrl = deck.bundle_path
    ? `/api/hosted/${deck.id}/index.html`
    : null
  const externalUrl = deck.deployed_url
  const viewerUrl = hostedUrl ?? externalUrl

  if (!viewerUrl) {
    return (
      <CenteredMessage
        title={deck.name}
        description="This deck has not been deployed yet. Push from the CLI or upload a zip to get started."
      />
    )
  }

  const isSandboxed = Boolean(hostedUrl)

  return (
    <div className="h-screen w-screen">
      <ViewTracker deckId={deck.id} shareToken={shareToken} />
      <iframe
        src={viewerUrl}
        title={deck.name}
        className="w-full h-full border-none"
        allow="fullscreen"
        sandbox={isSandboxed ? 'allow-scripts allow-same-origin' : undefined}
      />
    </div>
  )
}

function PrivateMessage() {
  return (
    <CenteredMessage
      title="This deck is private"
      description="You need permission to view this presentation."
    />
  )
}

function CenteredMessage({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-[var(--muted-foreground)]">{description}</p>
      </div>
    </div>
  )
}
