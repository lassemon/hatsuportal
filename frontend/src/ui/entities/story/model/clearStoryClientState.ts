import { getDefaultStore } from 'jotai'
import { storyAtom } from 'ui/entities/story/model/storyAtom'
import { createStoryDraftAtom } from 'ui/entities/story/model/createStoryDraftAtom'
import { storyEditDraftsAtom } from 'ui/entities/story/model/storyEditDraftsAtom'
import { storyViewModeAtom } from 'ui/entities/story/model/storyViewModeAtom'
import { localStorageStoryAtom } from 'ui/entities/story/model/localStorageStoryAtom'

const LOCAL_STORY_ATOM_KEY = 'localStoryAtom'
const STORY_SERVICE_CACHE_KEY = 'storyState'

export function clearStoryClientState(): void {
  const store = getDefaultStore()

  store.set(storyAtom, null)
  store.set(createStoryDraftAtom, null)
  store.set(storyEditDraftsAtom, {})
  store.set(storyViewModeAtom, {})
  store.set(localStorageStoryAtom, null)

  localStorage.removeItem(LOCAL_STORY_ATOM_KEY)
  localStorage.removeItem(STORY_SERVICE_CACHE_KEY)
  // atomWithStorage keys (must match your atoms):
  localStorage.removeItem('storyCreateDraft')
  localStorage.removeItem('storyEditDraftsByStoryId')
  localStorage.removeItem('storyViewModeByStoryId')
}
