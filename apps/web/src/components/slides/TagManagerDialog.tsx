'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tag } from '@/lib/supabase/types'

type TagManagerDialogProps = {
  isOpen: boolean
  tags: Tag[]
  onClose: () => void
  onTagsChange: (tags: Tag[]) => void
}

export function TagManagerDialog({ isOpen, tags, onClose, onTagsChange }: TagManagerDialogProps) {
  const supabase = useMemo(() => createClient(), [])

  if (!isOpen) {
    return null
  }

  const updateTagColor = async (tag: Tag, color: string) => {
    await supabase.from('tags').update({ color }).eq('id', tag.id)
    onTagsChange(tags.map((currentTag) => (currentTag.id === tag.id ? { ...currentTag, color } : currentTag)))
  }

  const deleteTag = async (tagId: string) => {
    await supabase.from('tags').delete().eq('id', tagId)
    onTagsChange(tags.filter((tag) => tag.id !== tagId))
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-[var(--n-radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tag manager</h2>
          <button type="button" onClick={onClose} className="text-sm text-[var(--muted-foreground)]">Close</button>
        </div>

        <div className="space-y-2">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between rounded-[var(--n-radius-sm)] border border-[var(--border)] p-2">
              <span className="text-sm">{tag.name}</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={tag.color}
                  onChange={(event) => updateTagColor(tag, event.target.value)}
                  className="h-8 w-8 rounded-[var(--n-radius-sm)] border border-[var(--border)]"
                />
                <button type="button" onClick={() => deleteTag(tag.id)} className="text-xs text-[var(--destructive)]">Delete</button>
              </div>
            </div>
          ))}
          {tags.length === 0 && <p className="text-sm text-[var(--muted-foreground)]">No tags yet.</p>}
        </div>
      </div>
    </div>
  )
}
