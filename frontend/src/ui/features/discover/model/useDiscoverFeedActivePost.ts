import { useCallback, useEffect, useRef } from 'react'
import { PostViewModel, PostViewModelDTO } from 'ui/entities/post/model/PostViewModel'
import { type FeedMode, stillPuttingThemBack } from './discoverFeedCatchUpReducer'

export type PostWeSawThemWatching = {
  postTheyWereWatching: string
  placeInTheList: number
}

type RememberTheyWereWatchingFn = (watched: PostWeSawThemWatching) => void

export type UseDiscoverFeedActivePostArgs = {
  posts: PostViewModel<PostViewModelDTO>[]
  postWeSawThemWatchingRef: React.MutableRefObject<PostWeSawThemWatching | null>
  feedModeRef: React.MutableRefObject<FeedMode>
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  rememberTheyWereWatching: RememberTheyWereWatchingFn
}

const DEBOUNCE_MS = 150

export function useDiscoverFeedActivePost({
  posts,
  postWeSawThemWatchingRef,
  feedModeRef,
  scrollContainerRef,
  rememberTheyWereWatching
}: UseDiscoverFeedActivePostArgs) {
  const postsRef = useRef(posts)
  postsRef.current = posts

  const rowElementsRef = useRef(new Map<number, HTMLElement>())
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const watchTargetFromActiveIndex = useCallback((placeInTheList: number): PostWeSawThemWatching | null => {
    const post = postsRef.current[placeInTheList]
    if (!post) {
      return null
    }
    return { postTheyWereWatching: post.id, placeInTheList }
  }, [])

  const persistWatchedPlaceFromRef = useCallback(() => {
    if (stillPuttingThemBack(feedModeRef.current)) {
      return
    }
    const watched = postWeSawThemWatchingRef.current
    if (!watched) {
      return
    }
    const post = postsRef.current[watched.placeInTheList]
    if (!post || post.id !== watched.postTheyWereWatching) {
      postWeSawThemWatchingRef.current = null
      return
    }
    rememberTheyWereWatching(watched)
  }, [feedModeRef, postWeSawThemWatchingRef, rememberTheyWereWatching])

  const scheduleDebouncedPersist = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null
      persistWatchedPlaceFromRef()
    }, DEBOUNCE_MS)
  }, [persistWatchedPlaceFromRef])

  const noteUserOpenedPost = useCallback(
    (index: number, postId: string) => {
      if (stillPuttingThemBack(feedModeRef.current)) {
        return
      }
      const target = watchTargetFromActiveIndex(index)
      if (!target || target.postTheyWereWatching !== postId) {
        return
      }
      postWeSawThemWatchingRef.current = target
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      persistWatchedPlaceFromRef()
    },
    [feedModeRef, persistWatchedPlaceFromRef, postWeSawThemWatchingRef, watchTargetFromActiveIndex]
  )

  useEffect(() => {
    const root = scrollContainerRef.current
    if (!root) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (stillPuttingThemBack(feedModeRef.current)) {
          return
        }
        let best: IntersectionObserverEntry | undefined
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue
          }
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry
          }
        }
        if (!best) {
          return
        }

        const rawIndex = (best.target as HTMLElement).dataset.feedIndex
        if (rawIndex === undefined) {
          return
        }
        const activeIndex = Number(rawIndex)
        if (Number.isNaN(activeIndex)) {
          return
        }

        const target = watchTargetFromActiveIndex(activeIndex)
        if (!target) {
          postWeSawThemWatchingRef.current = null
          return
        }
        postWeSawThemWatchingRef.current = target
        scheduleDebouncedPersist()
      },
      { root, threshold: 0.6 }
    )

    intersectionObserverRef.current = observer
    for (const el of rowElementsRef.current.values()) {
      observer.observe(el)
    }

    return () => {
      observer.disconnect()
      intersectionObserverRef.current = null
    }
  }, [feedModeRef, postWeSawThemWatchingRef, scheduleDebouncedPersist, scrollContainerRef, watchTargetFromActiveIndex])

  const registerPostRowRef = useCallback((index: number, el: HTMLDivElement | null) => {
    const observer = intersectionObserverRef.current
    const prev = rowElementsRef.current.get(index)
    if (prev && observer) {
      observer.unobserve(prev)
    }

    if (!el) {
      rowElementsRef.current.delete(index)
      return
    }

    el.dataset.feedIndex = String(index)
    rowElementsRef.current.set(index, el)
    observer?.observe(el)
  }, [])

  useEffect(() => {
    const observer = intersectionObserverRef.current
    for (const [index, el] of [...rowElementsRef.current.entries()]) {
      if (index >= posts.length) {
        observer?.unobserve(el)
        rowElementsRef.current.delete(index)
      }
    }
  }, [posts.length])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
      persistWatchedPlaceFromRef()
    }
  }, [persistWatchedPlaceFromRef])

  return { registerPostRowRef, noteUserOpenedPost }
}
