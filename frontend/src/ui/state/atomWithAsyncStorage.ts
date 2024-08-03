import { isPromise, PromiseOrValue } from '@hatsuportal/common'
import { StorageParseError } from 'infrastructure/errors/StorageParseError'
import { StorageSyncError } from 'infrastructure/errors/StorageSyncError'
import { LocalStorageService } from 'infrastructure/services/storage/LocalStorageService'
import { atom } from 'jotai'
import { errorAtom } from 'ui/state/errorAtom'

export type UpdateFunction<T> = (oldValue: T) => T | undefined
export type UpdateParam<T> = UpdateFunction<T> | T

export type LoadParser<T> = (value: T) => T
export type SaveParser<T> = (value: T) => { [key: string]: any }

export type AsyncStorageParsers<T> = {
  loadParser?: LoadParser<T>
  storeParser?: SaveParser<T>
}

export const atomWithAsyncStorage = <T extends unknown>(key: string, initialValue: T, parsers?: AsyncStorageParsers<T>) => {
  const localStorageService = new LocalStorageService<T>(localStorage)
  const loadParser = parsers?.loadParser ? parsers.loadParser : (value: T) => value
  const storeParser = parsers?.storeParser ? parsers.storeParser : (value: T) => value
  const baseAtom = atom<PromiseOrValue<T>>(
    localStorageService.findById(key).then((result) => {
      return result ? loadParser(result) : initialValue
    })
  )
  const derivedAtom = atom(
    (get) => get(baseAtom), // do not set this to async, it will cause the page to jump on each re-render
    (get, set, update: UpdateParam<T>) => {
      const getNextValue = (oldValue: T) => {
        const parsedValue = update instanceof Function ? update(oldValue) : (update as T)
        return parsedValue ? parsedValue : oldValue
      }
      const insertToStore = (nextValue: T) => {
        try {
          localStorageService
            .store(storeParser(nextValue) as T, key)
            .then(() => {
              set(baseAtom, nextValue)
            })
            .catch((error) => {
              console.error(error)
              set(errorAtom, new StorageSyncError(error && error.message ? error.message : error))
            })
        } catch (error) {
          set(errorAtom, new StorageParseError(error?.toString()))
        }
      }
      const oldValueDataOrPromise = get(baseAtom)
      if (isPromise(oldValueDataOrPromise)) {
        oldValueDataOrPromise.then((oldValue) => {
          const nextValue = getNextValue(oldValue)
          set(baseAtom, nextValue)
          insertToStore(nextValue)
        })
      } else {
        const nextValue = getNextValue(oldValueDataOrPromise)
        set(baseAtom, nextValue)
        insertToStore(nextValue)
      }
    }
  )
  return derivedAtom
}

export default atomWithAsyncStorage
