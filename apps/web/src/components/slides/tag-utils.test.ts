import { describe, expect, it } from 'vitest'
import { buildDeckTagsByDeckId, filterDeckIdsByTag, normalizeTagName } from './tag-utils'

describe('tag-utils', () => {
  it('normalizes tag names from user input', () => {
    expect(normalizeTagName('   Product    Strategy  ')).toBe('Product Strategy')
  })

  it('maps deck tag assignments into deck buckets', () => {
    const result = buildDeckTagsByDeckId({
      deckTags: [
        { deck_id: 'deck-1', tag_id: 'tag-1', created_at: new Date().toISOString() },
        { deck_id: 'deck-2', tag_id: 'tag-2', created_at: new Date().toISOString() },
      ],
      tags: [
        {
          id: 'tag-1',
          owner_id: 'user-1',
          name: 'Revenue',
          color: '#EF4444',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'tag-2',
          owner_id: 'user-1',
          name: 'Q2',
          color: '#3B82F6',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    })

    expect(result['deck-1']?.[0]?.name).toBe('Revenue')
    expect(result['deck-2']?.[0]?.name).toBe('Q2')
  })

  it('filters decks by active tag id', () => {
    const filteredDeckIds = filterDeckIdsByTag({
      activeTagId: 'tag-1',
      deckIds: ['deck-1', 'deck-2'],
      deckTagsByDeckId: {
        'deck-1': [
          {
            id: 'tag-1',
            owner_id: 'user-1',
            name: 'Revenue',
            color: '#EF4444',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        'deck-2': [],
      },
    })

    expect(filteredDeckIds).toEqual(['deck-1'])
  })
})
