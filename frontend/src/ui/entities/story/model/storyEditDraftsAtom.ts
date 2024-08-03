import { unixtimeNow } from '@hatsuportal/common'
import { atomWithStorage } from 'jotai/utils'
import { StoryViewModel, StoryViewModelDTO } from 'ui/entities/story/model/StoryViewModel'

export type StoryEditDraftsById = Record<string, StoryViewModel>

function hydrateDrafts(raw: unknown): StoryEditDraftsById {
  if (!raw || typeof raw !== 'object') {
    return {}
  }
  const result: StoryEditDraftsById = {}
  for (const [id, dto] of Object.entries(raw as Record<string, StoryViewModelDTO>)) {
    try {
      result[id] = new StoryViewModel(dto)
    } catch {
      // skip corrupt entry
    }
  }
  return result
}

export const storyEditDraftsAtom = atomWithStorage<StoryEditDraftsById>(
  'storyEditDraftsByStoryId',
  {},
  {
    getItem: (key, initialValue) => {
      try {
        return hydrateDrafts(JSON.parse(localStorage.getItem(key) || '{}'))
      } catch {
        return initialValue
      }
    },
    setItem: (key, newValue) => {
      const payload: Record<string, StoryViewModelDTO & { updatedAt: number }> = {}
      for (const [id, story] of Object.entries(newValue)) {
        payload[id] = { ...story.toJSON(), updatedAt: unixtimeNow() }
      }
      localStorage.setItem(key, JSON.stringify(payload))
    },
    removeItem: (key) => localStorage.removeItem(key)
  },
  { getOnInit: true }
)
