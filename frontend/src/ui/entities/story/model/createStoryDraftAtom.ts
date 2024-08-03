import { atomWithStorage } from 'jotai/utils'
import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'
import { unixtimeNow } from '@hatsuportal/common'

export const createStoryDraftAtom = atomWithStorage<StoryViewModel | null>(
  'storyCreateDraft',
  null,
  {
    getItem: (key, initialValue) => {
      const stored = JSON.parse(localStorage.getItem(key) || 'null')
      try {
        return stored ? new StoryViewModel(stored) : initialValue
      } catch {
        return initialValue
      }
    },
    setItem: (key, newValue) => {
      if (newValue === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify({ ...newValue.toJSON(), updatedAt: unixtimeNow() }))
      }
    },
    removeItem: (key) => localStorage.removeItem(key)
  },
  { getOnInit: true }
)
