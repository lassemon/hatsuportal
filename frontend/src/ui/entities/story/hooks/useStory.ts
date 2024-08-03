import { useAtom, useSetAtom } from 'jotai'
import React, { useEffect, useRef, useState } from 'react'
import { UpdateParam } from 'ui/shared/util/atomWithAsyncStorage'
import { storyAtom } from 'ui/entities/story/model/storyAtom'
import config from 'config'
import { unstable_batchedUpdates } from 'react-dom'
import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'
import { IStoryService } from 'application/interfaces'
import { authAtom } from 'ui/entities/user/state/authAtom'
import { errorAtom } from 'ui/shared/state/errorAtom'
import { STORY_DEFAULTS } from 'infrastructure/services/data/StoryService'
import { unixtimeNow } from '@hatsuportal/common'
import { storyEditDraftsAtom } from '../model/storyEditDraftsAtom'
import { localStorageStoryAtom } from '../model/localStorageStoryAtom'

const DEBUG = false

type UseStoryReturn = [
  {
    loadingStory: boolean
    story: StoryViewModel | null
    backendStory: StoryViewModel | null
    setBackendStory: React.Dispatch<React.SetStateAction<StoryViewModel | null>>
    storyError?: any
  },
  (update: UpdateParam<StoryViewModel | null>) => void,
  (savedStory: StoryViewModel) => void
]

export interface UseStoryWithImageOptions {
  persist?: boolean
  useDefault?: boolean
}

// TODO, this whole hook is a mess, it should be refactored to be more readable and maintainable
export const useStory = (
  storyService: IStoryService,
  storyId?: string,
  options: UseStoryWithImageOptions = { persist: false, useDefault: true }
): UseStoryReturn => {
  DEBUG && console.log('useStory setup id:', storyId)
  const { persist, useDefault = true } = options
  const [authState] = useAtom(authAtom)

  const storyRequestControllerRef = useRef<AbortController | null>(null)

  const setError = useSetAtom(errorAtom)

  const [story, setStory] = useAtom(storyAtom)
  const [localStorageStory, setLocalStorageStory] = useAtom(localStorageStoryAtom)
  const [editDraftsByStoryId, setEditDraftsByStoryId] = useAtom(storyEditDraftsAtom)
  const [backendStory, setBackendStory] = useState<StoryViewModel | null>(null)

  const [storyError, setStoryError] = useState<any>(null)
  const [isLoadingStory, setIsLoadingStory] = useState(false)

  const draftForRoute = storyId && editDraftsByStoryId[storyId] ? editDraftsByStoryId[storyId] : null
  let returnStory =
    (persist === true && draftForRoute) ||
    (persist === true && localStorageStory?.id === storyId ? localStorageStory : null) ||
    story ||
    null

  useEffect(() => {
    DEBUG && console.log('storyId changed =>', storyId)
    const fetchAndSetStory = async (_storyId: string) => {
      try {
        setIsLoadingStory(true)
        const controller = new AbortController()
        storyRequestControllerRef.current = controller
        DEBUG && console.log('getting story by id  =>', _storyId)
        const fetchedStory = await storyService.findById(_storyId, { signal: controller.signal }).catch((error) => {
          console.log('error', error)
          setError(error)
          return null
        })

        if (fetchedStory) {
          unstable_batchedUpdates(() => {
            setIsLoadingStory(false)
            const localStorageStoryIsSameAsFetched = fetchedStory.id === localStorageStory?.id
            const localStorageStoryIsNewer = (fetchedStory?.updatedAt || 0) < (localStorageStory?.updatedAt || -1)
            setBackendStory(fetchedStory)

            DEBUG && console.log('localStorageStoryIsSameAsFetched', localStorageStoryIsSameAsFetched)
            DEBUG && console.log('localStorageStoryIsNewer', localStorageStoryIsNewer)

            const editDraft = editDraftsByStoryId[fetchedStory.id]
            const editDraftIsNewerThanServer = !!editDraft && (fetchedStory.updatedAt || 0) < (editDraft.updatedAt || 0)
            const workingStory = editDraftIsNewerThanServer ? editDraft : fetchedStory
            setStory(workingStory)

            const storedIsCreateDraft = localStorageStory?.id === '' || localStorageStory?.id === STORY_DEFAULTS.NEW_STORY_ID

            const shouldReplaceLocalCache =
              !storedIsCreateDraft &&
              localStorageStory?.id === fetchedStory.id &&
              ((localStorageStoryIsSameAsFetched && !localStorageStoryIsNewer) || !localStorageStoryIsSameAsFetched)

            if (shouldReplaceLocalCache && !editDraftIsNewerThanServer) {
              fetchedStory.updatedAt = unixtimeNow()
              setLocalStorageStory(fetchedStory)
            }
          })
        }
      } catch (error: any) {
        unstable_batchedUpdates(() => {
          setIsLoadingStory(false)
          setStoryError(error)
          setError(error?.message ? error.message : error)
        })
      }
    }

    const storyIdExists = !!storyId
    const storyIdIsTheSameAsSavedStory = storyId === (persist ? localStorageStory?.id : story?.id)
    const storyExists = !!returnStory
    const isNewStory = storyId === STORY_DEFAULTS.NEW_STORY_ID
    const localStorageInvalidated = (localStorageStory?.updatedAt || 0) < unixtimeNow() + config.localStorageInvalidateTimeInMilliseconds

    const shouldFetchStory =
      (storyIdExists && !storyIdIsTheSameAsSavedStory && !isNewStory) ||
      (storyIdExists && !storyExists && !isNewStory) ||
      (authState.loggedIn && storyIdExists && persist && localStorageInvalidated && !isNewStory)

    if (DEBUG) {
      console.log('\n\n\n')
      console.log('storyIdExists', storyIdExists)
      console.log('storyIdIsTheSameAsSavedStory', storyIdIsTheSameAsSavedStory)
      console.log('isNewStory', isNewStory)
      console.log('storyExists', storyExists)
      console.log('authState.loggedIn', authState.loggedIn)
      console.log('persist', persist)
      console.log('localStorageInvalidated', localStorageInvalidated)
      console.log('---')
      console.log('backendStory?.id', backendStory?.id)
      console.log('localStorageStory?.id', localStorageStory?.id)
      console.log('storyId', storyId)
      console.log('isLoadingStory', isLoadingStory)
      console.log('story?.id', story?.id)
      //console.log('local storage story last updated at', dateStringFromUnixTime(localStorageStory?.updatedAt || 0))
      console.log('shouldFetchStory', shouldFetchStory)
      console.log('\n\n\n')
    }

    if (shouldFetchStory && !isLoadingStory) {
      fetchAndSetStory(storyId)
    } else if (!storyIdExists && !storyExists && useDefault) {
      DEBUG && console.log('fetching default story')
      fetchAndSetStory(STORY_DEFAULTS.DEFAULT_STORY_ID)
    }
  }, [storyId])

  useEffect(() => {
    return () => {
      DEBUG && console.log('ABORTING story fetch')
      storyRequestControllerRef?.current?.abort()
    }
  }, [])

  DEBUG && console.log('useStory - given storyid', storyId)
  DEBUG && console.log('useStory - returnStory story id', returnStory?.id)

  const isCreateRoute = !storyId
  const isUnsavedCreateDraft = returnStory?.id === '' || returnStory?.id === STORY_DEFAULTS.NEW_STORY_ID
  const storyForRoute = storyId === returnStory?.id || (isCreateRoute && isUnsavedCreateDraft) ? returnStory : null

  const storyState = {
    loadingStory: isLoadingStory,
    story: storyForRoute,
    backendStory: backendStory?.clone(backendStory.toJSON()) || null,
    setBackendStory,
    ...(storyError ? { storyError: storyError } : {})
  }

  const setStoryToAtomAndLocalStorage = (update: UpdateParam<StoryViewModel | null>) => {
    setStory(update)
    let parsedValue = update instanceof Function ? update(story) : update

    if (!parsedValue) {
      return
    }

    parsedValue.updatedAt = unixtimeNow()

    if (parsedValue.id) {
      setEditDraftsByStoryId({ ...editDraftsByStoryId, [parsedValue.id]: parsedValue })
    }

    if (localStorageStory?.id === parsedValue.id) {
      setLocalStorageStory(parsedValue)
    }
  }

  const reconcileStoryAfterSave = (savedStory: StoryViewModel) => {
    setBackendStory(savedStory)
    setStory(savedStory)
    if (savedStory.id) {
      const { [savedStory.id]: _removed, ...rest } = editDraftsByStoryId
      setEditDraftsByStoryId(rest)
    }
    if (localStorageStory?.id === savedStory.id) {
      setLocalStorageStory(savedStory)
    }
  }

  return [storyState, setStoryToAtomAndLocalStorage, reconcileStoryAfterSave]
}

export default useStory
