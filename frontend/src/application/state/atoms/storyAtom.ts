import { StoryPresentation } from '@hatsuportal/presentation-post'
import { Getter, Setter, atom } from 'jotai'
type UpdateFunction<T> = (oldValue: T) => T | undefined
export type UpdateParam<T> = UpdateFunction<T> | T

const baseStoryAtom = atom<StoryPresentation | null>(null)
export const storyAtom = atom(
  (get: Getter) => get(baseStoryAtom),
  (get: Getter, set: Setter, update: UpdateParam<StoryPresentation | null>) => {
    const oldValue = get(baseStoryAtom)
    const parsedValue = update instanceof Function ? update(oldValue) : update
    const newValue = typeof parsedValue !== 'undefined' ? parsedValue : oldValue
    set(baseStoryAtom, newValue?.clone() || null)
  }
)
