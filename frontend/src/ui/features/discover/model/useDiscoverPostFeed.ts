import { EntityTypeEnum } from '@hatsuportal/common'
import { useEntityServiceContext } from 'infrastructure/hooks/useEntityServiceContext'
import { useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { PostViewModel, PostViewModelDTO } from 'ui/entities/post/model/PostViewModel'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import { errorAtom } from 'ui/shared/state/errorAtom'
import { type CatchUpDecision, type CatchUpEvent, type FeedMode, decideCatchUp, stillPuttingThemBack } from './discoverFeedCatchUpReducer'
import { DiscoverRules } from './DiscoverRules'
import { SavedPlace, type SavedPlaceData } from './SavedPlace'
import { type WhenTheFeedOpens, type DiscoverFeedSession } from './discoverFeedSession'
import type { PostWeSawThemWatching } from './useDiscoverFeedActivePost'

type LoadPostsIntent =
  | { kind: 'startFresh'; page: number }
  | { kind: 'append'; page: number }
  | { kind: 'loadEnoughToReachThem'; pagesNeeded: number }

export function useDiscoverPostFeed(
  whenTheFeedOpens: WhenTheFeedOpens,
  feedSession: DiscoverFeedSession,
  postWeSawThemWatchingRef: React.MutableRefObject<PostWeSawThemWatching | null>
) {
  const { postService } = useEntityServiceContext()
  const setError = useSetAtom(errorAtom)
  const navigate = useNavigate()
  const discoverRules = useMemo(() => DiscoverRules.forCurrentDiscoverFeed(), [])
  const persistedDiscoverRules = useMemo(() => discoverRules.toPersisted(), [discoverRules])

  const [feedMode, commitFeedMode] = useReducer((_mode: FeedMode, next: FeedMode) => next, whenTheFeedOpens.feedMode)
  const feedModeRef = useRef(feedMode)
  feedModeRef.current = feedMode

  const [posts, setPosts] = useState<PostViewModel<PostViewModelDTO>[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [startAtTop, setStartAtTop] = useState(0)

  const postsWeHave = useRef<PostViewModel<PostViewModelDTO>[]>([])
  const lastPageWeLoaded = useRef(0)
  const feedTotalCountRef = useRef(0)
  const totalCountAtListBaseRef = useRef(0)
  const loadPostsForFeedAbortRef = useRef<AbortController | null>(null)
  const loadMoreInFlightRef = useRef(false)
  const catchUpAttemptId = useRef(0)

  const applyCatchUpFollowThrough = useCallback(
    (steps: CatchUpDecision['followThrough']) => {
      for (const step of steps) {
        if (step === 'forgetSavedPlace') {
          feedSession.forgetSavedPlace()
          postWeSawThemWatchingRef.current = null
        }
        if (step === 'startAtTop') {
          setStartAtTop((t) => t + 1)
        }
        if (step === 'ignoreThisCatchUpIfItFinishesLate') {
          catchUpAttemptId.current += 1
        }
      }
    },
    [feedSession, postWeSawThemWatchingRef]
  )

  const decideCatchUpFromHook = useCallback(
    (event: CatchUpEvent) => {
      const prevMode = feedModeRef.current
      const { mode: nextMode, followThrough } = decideCatchUp(prevMode, event)
      feedModeRef.current = nextMode
      if (nextMode !== prevMode) {
        commitFeedMode(nextMode)
      }
      applyCatchUpFollowThrough(followThrough)
    },
    [applyCatchUpFollowThrough]
  )

  const rememberTheyWereWatching = useCallback(
    (watched: PostWeSawThemWatching) => {
      if (stillPuttingThemBack(feedModeRef.current)) {
        return
      }
      if (postsWeHave.current.length === 0) {
        return
      }
      feedSession.rememberSavedPlace({
        postTheyWereWatching: watched.postTheyWereWatching,
        placeInTheList: watched.placeInTheList,
        pagesScrolled: Math.floor(watched.placeInTheList / DiscoverRules.postsPerPage),
        totalPostsWhenTheyLeft: totalCountAtListBaseRef.current,
        discoverRules: persistedDiscoverRules,
        viewer: whenTheFeedOpens.viewer
      })
    },
    [feedSession, persistedDiscoverRules, whenTheFeedOpens.viewer]
  )

  const loadPostsForFeed = useCallback(
    async (intent: LoadPostsIntent): Promise<{ posts: PostViewModel<PostViewModelDTO>[]; totalCount: number } | null> => {
      loadPostsForFeedAbortRef.current?.abort()
      setLoading(true)
      const controller = new AbortController()
      loadPostsForFeedAbortRef.current = controller

      const request =
        intent.kind === 'loadEnoughToReachThem'
          ? discoverRules.toSearchRequest(0, intent.pagesNeeded * DiscoverRules.postsPerPage)
          : discoverRules.toSearchRequest(intent.page)

      try {
        const result = await postService.search(request, {
          signal: controller.signal
        })
        if (loadPostsForFeedAbortRef.current !== controller) {
          return null
        }

        const nextList = intent.kind === 'append' ? [...postsWeHave.current, ...result.posts] : result.posts
        const nextLastPage = intent.kind === 'loadEnoughToReachThem' ? intent.pagesNeeded - 1 : intent.page

        postsWeHave.current = nextList
        lastPageWeLoaded.current = nextLastPage
        feedTotalCountRef.current = result.totalCount
        if (intent.kind !== 'append') {
          totalCountAtListBaseRef.current = result.totalCount
        }
        setPosts(nextList)
        setTotalCount(result.totalCount)

        return { posts: nextList, totalCount: result.totalCount }
      } catch (error: unknown) {
        if (!(error instanceof DOMException)) {
          setError(error instanceof Error ? error : new Error('Failed to load posts'))
        }
        return null
      } finally {
        if (loadPostsForFeedAbortRef.current === controller) {
          setLoading(false)
          loadMoreInFlightRef.current = false
        }
      }
    },
    [postService, setError, discoverRules]
  )

  const resetAndFetch = useCallback(async () => {
    loadMoreInFlightRef.current = false
    postsWeHave.current = []
    lastPageWeLoaded.current = 0
    feedTotalCountRef.current = 0
    totalCountAtListBaseRef.current = 0
    setPosts([])
    setTotalCount(0)
    const result = await loadPostsForFeed({ kind: 'startFresh', page: 0 })
    if (result) {
      setStartAtTop((t) => t + 1)
    }
  }, [loadPostsForFeed])

  const loadEnoughToReachThem = useCallback(
    (pagesNeeded: number) => loadPostsForFeed({ kind: 'loadEnoughToReachThem', pagesNeeded }),
    [loadPostsForFeed]
  )

  const beginCatchUpAttempt = () => {
    catchUpAttemptId.current += 1
    return catchUpAttemptId.current
  }

  const thisCatchUpWasAbandoned = (attempt: number) => attempt !== catchUpAttemptId.current

  const exitCatchUpRequestFailed = useCallback(
    async (attempt: number) => {
      const hadPosts = postsWeHave.current.length > 0
      decideCatchUpFromHook({ type: 'catchUpRequestFailed' })
      if (thisCatchUpWasAbandoned(attempt)) {
        return
      }
      if (!hadPosts) {
        const result = await loadPostsForFeed({ kind: 'startFresh', page: 0 })
        if (thisCatchUpWasAbandoned(attempt)) {
          return
        }
        if (result) {
          setStartAtTop((t) => t + 1)
        }
        return
      }
      setStartAtTop((t) => t + 1)
    },
    [decideCatchUpFromHook, loadPostsForFeed]
  )

  const resumeWhereTheyWere = useCallback(
    async (savedPlaceData: SavedPlaceData) => {
      const savedPlace = SavedPlace.fromPlain(savedPlaceData)
      const thisAttempt = beginCatchUpAttempt()
      decideCatchUpFromHook({
        type: 'puttingYouBack',
        postTheyWereWatching: savedPlace.postTheyWereWatching
      })

      let pagesNeeded = savedPlace.pagesToLoadFirst()
      let found = await loadEnoughToReachThem(pagesNeeded)
      if (thisCatchUpWasAbandoned(thisAttempt)) {
        return
      }
      if (!found) {
        await exitCatchUpRequestFailed(thisAttempt)
        return
      }

      if (!found.posts.some((p) => p.id === savedPlace.postTheyWereWatching) && savedPlace.hasFeedSizeForWiden()) {
        const widenedPages = savedPlace.pagesToLoadIfFeedGrew(found.totalCount)
        if (widenedPages > pagesNeeded) {
          pagesNeeded = widenedPages
          found = await loadEnoughToReachThem(pagesNeeded)
          if (thisCatchUpWasAbandoned(thisAttempt)) {
            return
          }
          if (!found) {
            await exitCatchUpRequestFailed(thisAttempt)
            return
          }
        }
      }

      const stillThere = found.posts.some((p) => p.id === savedPlace.postTheyWereWatching)
      decideCatchUpFromHook(
        stillThere
          ? {
              type: 'foundTheirPost',
              postTheyWereWatching: savedPlace.postTheyWereWatching
            }
          : {
              type: 'theirPostIsUnreachable',
              postTheyWereWatching: savedPlace.postTheyWereWatching
            }
      )
    },
    [decideCatchUpFromHook, exitCatchUpRequestFailed, loadEnoughToReachThem]
  )

  const loadMore = useCallback(() => {
    if (stillPuttingThemBack(feedModeRef.current)) {
      return
    }
    if (loading || loadMoreInFlightRef.current) {
      return
    }
    if (postsWeHave.current.length >= feedTotalCountRef.current) {
      return
    }
    loadMoreInFlightRef.current = true
    void loadPostsForFeed({ kind: 'append', page: lastPageWeLoaded.current + 1 })
  }, [loadPostsForFeed, loading])

  const onPostClick = useCallback(
    (post: PostViewModel<PostViewModelDTO>) => {
      if (post.postType === EntityTypeEnum.Story) {
        navigate([
          { href: '/stories', label: 'Stories' },
          { href: `/story/${post.id}`, label: `"${post.title}"` }
        ])
      } else {
        console.error(`No redirect url for post post type '${post.postType}'`)
      }
    },
    [navigate]
  )

  const onLandedOnTheirPost = useCallback(() => decideCatchUpFromHook({ type: 'landedOnTheirPost' }), [decideCatchUpFromHook])

  const onCouldNotPlaceThem = useCallback(() => decideCatchUpFromHook({ type: 'couldNotPlaceThem' }), [decideCatchUpFromHook])

  useEffect(() => {
    if (whenTheFeedOpens.savedPlace) {
      void resumeWhereTheyWere(whenTheFeedOpens.savedPlace)
    } else {
      void resetAndFetch()
    }
    return () => {
      catchUpAttemptId.current += 1
      loadPostsForFeedAbortRef.current?.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot init per keyed mount
  }, [])

  return {
    feedModeRef,
    feedMode,
    posts,
    loading,
    totalCount,
    startAtTop,
    loadMore,
    onPostClick,
    onLandedOnTheirPost,
    onCouldNotPlaceThem,
    rememberTheyWereWatching
  }
}
