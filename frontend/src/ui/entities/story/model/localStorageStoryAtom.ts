import { atomWithStorage } from 'jotai/utils'
import { StoryViewModel } from './StoryViewModel'
import { unixtimeNow } from '@hatsuportal/common'

export const localStorageStoryAtom = atomWithStorage<StoryViewModel | null | undefined>(
  'localStoryAtom',
  null,
  {
    getItem: (key, initialValue) => {
      const storedStory = JSON.parse(localStorage.getItem(key) || 'null')
      try {
        return storedStory ? new StoryViewModel(storedStory) : initialValue
      } catch (error) {
        console.error('error parsing stored story', error)
        return initialValue
      }
    },
    setItem: (key, newValue) => {
      if (newValue === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify({ ...newValue?.toJSON(), updatedAt: unixtimeNow() }))
      }
    },
    removeItem: (key) => {
      localStorage.removeItem(key)
    }
  },
  { getOnInit: true }
)
