'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Send, Trash2 } from 'lucide-react'

type Comment = {
  id: string
  slide_index: number | null
  author_email: string
  author_name: string | null
  content: string
  created_at: string
}

type CommentPanelProps = {
  deckId: string
  isOwner: boolean
  currentSlide?: number
}

export function CommentPanel({ deckId, isOwner, currentSlide }: CommentPanelProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      const resp = await fetch(`/api/decks/${deckId}/comments`)
      if (resp.ok) setComments(await resp.json())
    }
    load()
  }, [deckId, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !email.trim()) return
    setSubmitting(true)

    const resp = await fetch(`/api/decks/${deckId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_email: email.trim(),
        author_name: name.trim() || undefined,
        content: content.trim(),
        slide_index: currentSlide,
      }),
    })

    if (resp.ok) {
      const comment = await resp.json()
      setComments([comment, ...comments])
      setContent('')
    }
    setSubmitting(false)
  }

  const handleDelete = async (commentId: string) => {
    await fetch(`/api/decks/${deckId}/comments?commentId=${commentId}`, { method: 'DELETE' })
    setComments(comments.filter(c => c.id !== commentId))
  }

  const inputClass = 'w-full h-9 px-3 rounded-[var(--n-radius-sm)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--ring)]'

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium shadow-lg hover:opacity-90"
      >
        <MessageSquare className="w-4 h-4" />
        Feedback
        {comments.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
            {comments.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 z-40 w-80 max-h-[60vh] rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] shadow-xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
            <h3 className="text-sm font-semibold">Comments</h3>
            <button onClick={() => setIsOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-xs">
              Close
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {comments.length === 0 && (
              <p className="text-xs text-[var(--muted-foreground)] text-center py-4">
                No comments yet. Be the first to share feedback.
              </p>
            )}
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-[var(--n-radius-sm)] border border-[var(--border)] p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">
                    {comment.author_name || comment.author_email.split('@')[0]}
                  </span>
                  {isOwner && (
                    <button onClick={() => handleDelete(comment.id)} className="text-[var(--muted-foreground)] hover:text-[var(--destructive)]">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {comment.slide_index !== null && (
                  <span className="text-[10px] text-[var(--muted-foreground)]">
                    Slide {comment.slide_index + 1}
                  </span>
                )}
                <p className="text-xs text-[var(--muted-foreground)] mt-1">{comment.content}</p>
                <p className="text-[10px] text-[var(--muted-foreground)] mt-1 opacity-60">
                  {new Date(comment.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-[var(--border)] p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={inputClass} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className={inputClass} />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Leave feedback..."
                required
                className={`${inputClass} flex-1`}
              />
              <button
                type="submit"
                disabled={submitting || !content.trim() || !email.trim()}
                className="p-2 rounded-[var(--n-radius-sm)] bg-[var(--primary)] text-[var(--primary-foreground)] disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
