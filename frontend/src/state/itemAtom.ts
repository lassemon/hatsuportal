import { Item } from '@hatsuportal/domain'
import { Getter, Setter, atom } from 'jotai'
type UpdateFunction<T> = (oldValue: T) => T | undefined
export type UpdateParam<T> = UpdateFunction<T> | T

const baseItemAtom = atom<Item | null>(null)
export const itemAtom = atom(
  (get: Getter) => get(baseItemAtom),
  (get: Getter, set: Setter, update: UpdateParam<Item | null>) => {
    const oldValue = get(baseItemAtom)
    const parsedValue = update instanceof Function ? update(oldValue) : update
    const newValue = typeof parsedValue !== 'undefined' ? parsedValue : oldValue
    set(baseItemAtom, newValue?.clone() || null)
  }
)
