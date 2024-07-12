import { unixtimeNow } from '@hatsuportal/common'
import { authAtom, errorAtom } from 'infrastructure/dataAccess/atoms'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import React, { useEffect, useRef, useState } from 'react'
import { UpdateParam, itemAtom } from 'state/itemAtom'
import config from 'config'
import { unstable_batchedUpdates } from 'react-dom'
import { Item } from '@hatsuportal/domain'
import { ItemApiServiceInterface } from 'infrastructure/repositories/ItemApiServiceInterface'
import { ITEM_DEFAULTS } from 'defaults'

const DEBUG = false

type UseItemReturn = [
  {
    loadingItem: boolean
    item: Item | null
    backendItem: Item | null
    setBackendItem: React.Dispatch<React.SetStateAction<Item | null>>
    itemError?: any
  },
  (update: UpdateParam<Item | null>) => void
]

const localStorageItemAtom = atomWithStorage<Item | null | undefined>(
  'localItemAtom',
  null,
  {
    getItem: (key, initialValue) => {
      const storedItem = JSON.parse(localStorage.getItem(key) || 'null')
      return storedItem ? new Item(storedItem) : initialValue
    },
    setItem: (key, newValue) => {
      if (newValue === null) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify({ ...newValue?.serialize(), updatedAt: unixtimeNow() }))
      }
    },
    removeItem: (key) => {
      localStorage.removeItem(key)
    }
  },
  { getOnInit: true }
)

export interface UseItemWithImageOptions {
  persist?: boolean
  useDefault?: boolean
}

const useItem = (
  itemApiService: ItemApiServiceInterface,
  itemId?: string,
  options: UseItemWithImageOptions = { persist: false, useDefault: true }
): UseItemReturn => {
  DEBUG && console.log('useItem setup id:', itemId)
  const { persist, useDefault = true } = options
  const [authState] = useAtom(authAtom)

  const itemRequestControllerRef = useRef<AbortController | null>(null)

  const [, setError] = useAtom(React.useMemo(() => errorAtom, []))

  const [item, setItem] = useAtom(itemAtom)
  const [localStorageItem, setLocalStorageItem] = useAtom(localStorageItemAtom)
  const [backendItem, setBackendItem] = useState<Item | null>(null)

  const [itemError, setItemError] = useState<any>(null)
  const [isLoadingItem, setIsLoadingItem] = useState(false)

  let returnItem = (persist === true && localStorageItem ? localStorageItem : item) || null

  useEffect(() => {
    DEBUG && console.log('itemId changed =>', itemId)
    const fetchAndSetItem = async (_itemId: string) => {
      try {
        setIsLoadingItem(true)
        const controller = new AbortController()
        itemRequestControllerRef.current = controller
        DEBUG && console.log('getting item by id  =>', _itemId)
        const fetchedItem = await itemApiService.findById(_itemId, { signal: controller.signal }).catch((error) => {
          setError(error)
          return null
        })

        if (fetchedItem) {
          unstable_batchedUpdates(() => {
            setIsLoadingItem(false)
            const localStorageItemIsSameAsFetched = fetchedItem.id === localStorageItem?.id
            const localStorageItemIsNewer = (fetchedItem?.updatedAt || 0) < (localStorageItem?.updatedAt || -1)
            setBackendItem(new Item(fetchedItem))

            DEBUG && console.log('localStorageItemIsSameAsFetched', localStorageItemIsSameAsFetched)
            DEBUG && console.log('localStorageItemIsNewer', localStorageItemIsNewer)

            if ((localStorageItemIsSameAsFetched && !localStorageItemIsNewer) || !localStorageItemIsSameAsFetched) {
              setLocalStorageItem(new Item({ ...fetchedItem, updatedAt: unixtimeNow() }))
              setItem(new Item(fetchedItem))
            }
          })
        }
      } catch (error: any) {
        unstable_batchedUpdates(() => {
          setIsLoadingItem(false)
          setItemError(error)
          setError(error?.message ? error.message : error)
        })
      }
    }

    const itemIdExists = !!itemId
    const itemIdIsTheSameAsSavedItem = itemId === (persist ? localStorageItem?.id : item?.id)
    const itemExists = !!returnItem
    const isNewItem = itemId === ITEM_DEFAULTS.NEW_ITEM_ID
    const localStorageInvalidated = (localStorageItem?.updatedAt || 0) < unixtimeNow() + config.localStorageInvalidateTimeInMilliseconds

    const shouldFetchItem =
      (itemIdExists && !itemIdIsTheSameAsSavedItem && !isNewItem) ||
      (itemIdExists && !itemExists && !isNewItem) ||
      (authState.loggedIn && itemIdExists && persist && localStorageInvalidated && !isNewItem)

    if (DEBUG) {
      console.log('\n\n\n')
      console.log('itemIdExists', itemIdExists)
      console.log('itemIdIsTheSameAsSavedItem', itemIdIsTheSameAsSavedItem)
      console.log('isNewItem', isNewItem)
      console.log('itemExists', itemExists)
      console.log('authState.loggedIn', authState.loggedIn)
      console.log('persist', persist)
      console.log('localStorageInvalidated', localStorageInvalidated)
      console.log('---')
      console.log('backendItem?.id', backendItem?.id)
      console.log('localStorageItem?.id', localStorageItem?.id)
      console.log('itemId', itemId)
      console.log('isLoadingItem', isLoadingItem)
      console.log('item?.id', item?.id)
      //console.log('local storage item last updated at', dateStringFromUnixTime(localStorageItem?.updatedAt || 0))
      console.log('shouldFetchItem', shouldFetchItem)
      console.log('\n\n\n')
    }

    if (shouldFetchItem && !isLoadingItem) {
      fetchAndSetItem(itemId)
    } else if (!itemIdExists && !itemExists && useDefault) {
      DEBUG && console.log('fetching default item')
      fetchAndSetItem('defaultItem')
    }
  }, [itemId])

  useEffect(() => {
    return () => {
      DEBUG && console.log('ABORTING item fetch')
      itemRequestControllerRef?.current?.abort()
    }
  }, [])

  DEBUG && console.log('useItem - given itemid', itemId)
  DEBUG && console.log('useItem - returnItem item id', returnItem?.id)

  const itemState = {
    loadingItem: isLoadingItem,
    item: itemId === returnItem?.id ? returnItem : null,
    backendItem: backendItem?.clone(backendItem.serialize()) || null,
    setBackendItem,
    ...(itemError ? { itemError: itemError } : {})
  }

  const setItemToAtomAndLocalStorage = (update: UpdateParam<Item | null>) => {
    setItem(update)
    let parsedValue = update instanceof Function ? update(item) : update
    // set to localstorage here for both authenticated and not users so we don't need to pass this setter outside
    if (parsedValue) {
      parsedValue.updatedAt = unixtimeNow()
    }
    setLocalStorageItem(parsedValue)
  }

  return [itemState, setItemToAtomAndLocalStorage]
}

export default useItem
