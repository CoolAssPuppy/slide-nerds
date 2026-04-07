'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Tag } from '@/lib/supabase/types'
import { normalizeTagName } from '@/components/slides/tag-utils'

type TagManagerProps = {
  initialTags: Tag[]
}

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/

function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value)
}

function ColorPicker({ color, onChange }: { color: string; onChange: (hex: string) => void }) {
  const [hexInput, setHexInput] = useState(color)
  const nativeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setHexInput(color)
  }, [color])

  const handleHexChange = (value: string) => {
    setHexInput(value)
    if (isValidHex(value)) {
      onChange(value)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => nativeRef.current?.click()}
        className="h-8 w-8 shrink-0 rounded-[var(--n-radius-sm)] border border-[var(--border)] cursor-pointer shadow-sm transition-shadow hover:shadow-md"
        style={{ backgroundColor: color }}
      >
        <input
          ref={nativeRef}
          type="color"
          value={color}
          onChange={(e) => {
            onChange(e.target.value)
            setHexInput(e.target.value)
          }}
          className="sr-only"
          tabIndex={-1}
        />
      </button>
      <input
        value={hexInput}
        onChange={(e) => handleHexChange(e.target.value)}
        onBlur={() => {
          if (!isValidHex(hexInput)) setHexInput(color)
        }}
        placeholder="#3B82F6"
        className={`h-8 w-[5.5rem] px-2 font-mono text-xs rounded-[var(--n-radius-sm)] border bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] ${
          isValidHex(hexInput) ? 'border-[var(--input)]' : 'border-[var(--destructive)]'
        }`}
      />
    </div>
  )
}

export function TagManager({ initialTags }: TagManagerProps) {
  const supabase = useMemo(() => createClient(), [])
  const [tags, setTags] = useState(initialTags)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#3B82F6')
  const [isAdding, setIsAdding] = useState(false)

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
    setEditColor(tag.color)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditColor('')
  }

  const saveEdit = async () => {
    if (!editingId) return
    const name = normalizeTagName(editName)
    if (!name) return

    const duplicate = tags.find(
      (tag) => tag.id !== editingId && tag.name.toLowerCase() === name.toLowerCase(),
    )
    if (duplicate) return

    await supabase
      .from('tags')
      .update({ name, color: editColor })
      .eq('id', editingId)

    setTags((prev) =>
      prev.map((tag) =>
        tag.id === editingId ? { ...tag, name, color: editColor } : tag,
      ),
    )
    cancelEdit()
  }

  const deleteTag = async (tagId: string) => {
    if (!confirm('Delete this tag? It will be removed from all decks.')) return
    await supabase.from('tags').delete().eq('id', tagId)
    setTags((prev) => prev.filter((tag) => tag.id !== tagId))
  }

  const createTag = async () => {
    const name = normalizeTagName(newName)
    if (!name) return

    const duplicate = tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase())
    if (duplicate) return

    const { data } = await supabase
      .from('tags')
      .insert({ name, color: newColor })
      .select('*')
      .single()

    if (data) {
      setTags((prev) => [...prev, data as Tag])
    }
    setNewName('')
    setNewColor('#3B82F6')
    setIsAdding(false)
  }

  const nameInputClass =
    'h-8 flex-1 px-2 rounded-[var(--n-radius-sm)] border border-[var(--input)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]'

  return (
    <div>
      {tags.length > 0 ? (
        <div className="space-y-2">
          {tags.map((tag) => {
            const isEditing = editingId === tag.id

            return (
              <div
                key={tag.id}
                className="rounded-[var(--n-radius-md)] border border-[var(--border)] overflow-hidden transition-colors"
                style={{
                  borderLeftWidth: '3px',
                  borderLeftColor: isEditing ? editColor : tag.color,
                }}
              >
                {isEditing ? (
                  <div className="px-3 py-3 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        className={nameInputClass}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="h-8 px-3 rounded-[var(--n-radius-sm)] bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="h-8 px-2 rounded-[var(--n-radius-sm)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[var(--muted-foreground)]">Color</span>
                      <ColorPicker color={editColor} onChange={setEditColor} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 shrink-0 rounded-full shadow-sm"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-medium">{tag.name}</span>
                      <span className="font-mono text-[11px] text-[var(--muted-foreground)] uppercase">
                        {tag.color}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => startEdit(tag)}
                        className="rounded-[var(--n-radius-sm)] p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                        title="Edit tag"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTag(tag.id)}
                        className="rounded-[var(--n-radius-sm)] p-1.5 text-[var(--muted-foreground)] hover:text-[var(--destructive)] hover:bg-[var(--accent)] transition-colors"
                        title="Delete tag"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-[var(--muted-foreground)]">
          No tags yet. Tags help you organize and filter your slide decks.
        </p>
      )}

      {isAdding ? (
        <div
          className="mt-3 rounded-[var(--n-radius-md)] border border-dashed border-[var(--border)] overflow-hidden"
          style={{ borderLeftWidth: '3px', borderLeftStyle: 'solid', borderLeftColor: newColor }}
        >
          <div className="px-3 py-3 space-y-3">
            <div className="flex items-center gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') createTag()
                  if (e.key === 'Escape') {
                    setIsAdding(false)
                    setNewName('')
                  }
                }}
                placeholder="Tag name"
                className={nameInputClass}
                autoFocus
              />
              <button
                type="button"
                onClick={createTag}
                className="h-8 px-3 rounded-[var(--n-radius-sm)] bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false)
                  setNewName('')
                }}
                className="h-8 px-2 rounded-[var(--n-radius-sm)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--muted-foreground)]">Color</span>
              <ColorPicker color={newColor} onChange={setNewColor} />
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-3 flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <Plus size={14} />
          Add tag
        </button>
      )}
    </div>
  )
}
