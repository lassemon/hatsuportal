import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'
import { Getter, Setter, atom } from 'jotai'
import { UpdateParam } from 'ui/shared/lib/atomWithAsyncStorage'

const baseStoryAtom = atom<StoryViewModel | null>(null)
export const storyAtom = atom(
  (get: Getter) => get(baseStoryAtom),
  (get: Getter, set: Setter, update: UpdateParam<StoryViewModel | null>) => {
    const oldValue = get(baseStoryAtom)
    const parsedValue = update instanceof Function ? update(oldValue) : update
    const newValue = typeof parsedValue !== 'undefined' ? parsedValue : oldValue
    set(baseStoryAtom, newValue?.clone() || null)
  }
)
