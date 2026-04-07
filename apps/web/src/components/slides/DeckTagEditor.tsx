'use client'

import { useMemo, useState } from 'react'
import { Plus, Tag as TagIcon, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { DeckTag, Tag } from '@/lib/supabase/types'
import { normalizeTagName } from './tag-utils'

type DeckTagEditorProps = {
  deckId: string
  deckTags: Tag[]
  allTags: Tag[]
  onTagsChange: (nextTags: Tag[]) => void
  onTagLibraryChange: (tags: Tag[]) => void
}

export function DeckTagEditor({ deckId, deckTags, allTags, onTagsChange, onTagLibraryChange }: DeckTagEditorProps) {
  const supabase = useMemo(() => createClient(), [])
  const [isOpen, setIsOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3B82F6')

  const deckTagIds = new Set(deckTags.map((tag) => tag.id))

  const toggleTag = async (tag: Tag) => {
    if (deckTagIds.has(tag.id)) {
      await supabase.from('deck_tags').delete().eq('deck_id', deckId).eq('tag_id', tag.id)
      onTagsChange(deckTags.filter((currentTag) => currentTag.id !== tag.id))
      return
    }

    const insertPayload: Pick<DeckTag, 'deck_id' | 'tag_id'> = { deck_id: deckId, tag_id: tag.id }
    await supabase.from('deck_tags').insert(insertPayload)
    onTagsChange([...deckTags, tag])
  }

  const createTag = async () => {
    const normalizedName = normalizeTagName(newTagName)
    if (!normalizedName) {
      return
    }

    const { data: existingData } = await supabase
      .from('tags')
      .select('*')
      .ilike('name', normalizedName)
      .limit(1)
      .maybeSingle()

    const selectedTag = existingData
      ? (existingData as Tag)
      : await (async () => {
          const { data } = await supabase
            .from('tags')
            .insert({ name: normalizedName, color: newTagColor })
            .select('*')
            .single()

          return data as Tag
        })()

    if (!allTags.some((tag) => tag.id === selectedTag.id)) {
      onTagLibraryChange([...allTags, selectedTag])
    }

    if (!deckTagIds.has(selectedTag.id)) {
      await supabase.from('deck_tags').insert({ deck_id: deckId, tag_id: selectedTag.id })
      onTagsChange([...deckTags, selectedTag])
    }

    setNewTagName('')
  }

  return (
    <div
      className="relative"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 rounded-[var(--n-radius-sm)] border border-[var(--border)] px-2 py-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <TagIcon className="h-3.5 w-3.5" />
        Tag
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-[var(--n-radius-md)] border border-[var(--border)] bg-[var(--popover)] p-3 shadow-lg">
          <div className="space-y-1">
            {allTags.map((tag) => (
              <button
                type="button"
                key={tag.id}
                onClick={() => toggleTag(tag)}
                className="flex w-full items-center justify-between rounded-[var(--n-radius-sm)] px-2 py-1 text-left text-sm hover:bg-[var(--accent)]"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                  {tag.name}
                </span>
                {deckTagIds.has(tag.id) ? <Trash2 className="h-3.5 w-3.5 text-[var(--muted-foreground)]" /> : <Plus className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />}
              </button>
            ))}
          </div>

          <div className="mt-3 border-t border-[var(--border)] pt-3">
            <p className="mb-2 text-xs font-medium text-[var(--muted-foreground)]">Create tag</p>
            <div className="flex items-center gap-2">
              <input
                value={newTagName}
                onChange={(event) => setNewTagName(event.target.value)}
                placeholder="Name"
                className="h-8 flex-1 rounded-[var(--n-radius-sm)] border border-[var(--border)] bg-transparent px-2 text-xs"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(event) => setNewTagColor(event.target.value)}
                className="h-8 w-8 rounded-[var(--n-radius-sm)] border border-[var(--border)]"
              />
              <button
                type="button"
                onClick={createTag}
                className="h-8 rounded-[var(--n-radius-sm)] bg-[var(--primary)] px-2 text-xs text-[var(--primary-foreground)]"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
