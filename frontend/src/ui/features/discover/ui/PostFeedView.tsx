import { Box, Typography } from '@mui/material'
import React, { useEffect, useRef } from 'react'
import { PostViewModel, PostViewModelDTO } from 'ui/entities/post/model/PostViewModel'
import type { FeedMode } from 'ui/features/discover/model/discoverFeedCatchUpReducer'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'
import { CatchUpLoadingOverlay } from './CatchUpLoadingOverlay'
import { PostFeedCard } from './PostFeedCard'

const MAX_SCROLL_PLACE_ATTEMPTS = 20
const MAX_SCROLL_PLACE_MS = 500

interface PostFeedViewProps {
  posts: PostViewModel<PostViewModelDTO>[]
  loading: boolean
  totalCount: number
  startAtTop: number
  feedMode: FeedMode
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
  registerPostRowRef: (index: number, el: HTMLDivElement | null) => void
  noteUserOpenedPost: (index: number, postId: string) => void
  onLoadMore: () => void
  onPostClick: (post: PostViewModel<PostViewModelDTO>) => void
  onLandedOnTheirPost: () => void
  onCouldNotPlaceThem: () => void
}

export const PostFeedView: React.FC<PostFeedViewProps> = ({
  posts,
  loading,
  totalCount,
  startAtTop,
  feedMode,
  scrollContainerRef,
  registerPostRowRef,
  noteUserOpenedPost,
  onLoadMore,
  onPostClick,
  onLandedOnTheirPost,
  onCouldNotPlaceThem
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const wheelLockRef = useRef(false)
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore

  const alreadyLandedOnTheirPost = useRef(false)
  const scrollPlaceAttemptsRef = useRef(0)
  const scrollPlaceFailedDispatched = useRef(false)
  const lastCatchUpPostRef = useRef<string | null>(null)

  useEffect(() => {
    if (feedMode.kind === 'puttingYouBack') {
      if (lastCatchUpPostRef.current !== feedMode.postTheyWereWatching) {
        lastCatchUpPostRef.current = feedMode.postTheyWereWatching
        alreadyLandedOnTheirPost.current = false
      }
    } else {
      lastCatchUpPostRef.current = null
    }
  }, [feedMode])

  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [scrollContainerRef, startAtTop])

  useEffect(() => {
    const scrollRoot = scrollContainerRef.current
    if (!scrollRoot) return

    const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!finePointerQuery.matches) return

    const unlock = () => {
      wheelLockRef.current = false
    }

    const onWheel = (e: WheelEvent) => {
      const pageHeight = scrollRoot.clientHeight
      if (pageHeight === 0) return

      if (wheelLockRef.current) {
        e.preventDefault()
        return
      }

      if (e.deltaY === 0) return

      const currentIndex = Math.round(scrollRoot.scrollTop / pageHeight)
      const maxIndex = Math.max(0, Math.ceil(scrollRoot.scrollHeight / pageHeight) - 1)
      const nextIndex = e.deltaY > 0 ? currentIndex + 1 : currentIndex - 1

      if (nextIndex < 0 || nextIndex > maxIndex) {
        e.preventDefault()
        return
      }

      e.preventDefault()
      wheelLockRef.current = true

      scrollRoot.scrollTo({ top: nextIndex * pageHeight, behavior: 'smooth' })

      scrollRoot.addEventListener('scrollend', unlock, { once: true })
      window.setTimeout(unlock, 450)
    }

    scrollRoot.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      scrollRoot.removeEventListener('wheel', onWheel)
      wheelLockRef.current = false
    }
  }, [posts.length, loading, scrollContainerRef])

  useEffect(() => {
    const scrollRoot = scrollContainerRef.current
    const sentinel = sentinelRef.current
    if (feedMode.kind === 'puttingYouBack') return
    if (!scrollRoot || !sentinel || loading || posts.length >= totalCount) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMoreRef.current()
        }
      },
      { root: scrollRoot, threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [posts.length, loading, totalCount, startAtTop, feedMode.kind, scrollContainerRef])

  useEffect(() => {
    if (feedMode.kind !== 'puttingYouBack') {
      scrollPlaceAttemptsRef.current = 0
      scrollPlaceFailedDispatched.current = false
      return
    }
    if (!feedMode.searchFinished) return
    if (alreadyLandedOnTheirPost.current) return

    const postTheyWereWatching = feedMode.postTheyWereWatching

    const postMissing = !posts.some((p) => p.id === postTheyWereWatching)
    if (postMissing) {
      if (!scrollPlaceFailedDispatched.current) {
        scrollPlaceFailedDispatched.current = true
        onCouldNotPlaceThem()
      }
      return
    }

    const placeThemOnTheirPost = (): boolean => {
      const placeInTheList = posts.findIndex((p) => p.id === postTheyWereWatching)
      const root = scrollContainerRef.current
      if (placeInTheList < 0 || !root) return false
      const pageHeight = root.clientHeight
      if (pageHeight === 0) return false
      root.scrollTo({ top: placeInTheList * pageHeight, behavior: 'instant' })
      return true
    }

    const startedAt = performance.now()
    let rafId = 0
    let resizeObserver: ResizeObserver | undefined

    const failOnce = () => {
      if (scrollPlaceFailedDispatched.current) return
      scrollPlaceFailedDispatched.current = true
      onCouldNotPlaceThem()
    }

    const scheduleTry = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (alreadyLandedOnTheirPost.current) {
          return
        }
        if (placeThemOnTheirPost()) {
          alreadyLandedOnTheirPost.current = true
          onLandedOnTheirPost()
          return
        }
        scrollPlaceAttemptsRef.current += 1
        const elapsed = performance.now() - startedAt
        if (scrollPlaceAttemptsRef.current >= MAX_SCROLL_PLACE_ATTEMPTS || elapsed >= MAX_SCROLL_PLACE_MS) {
          failOnce()
          return
        }
        scheduleTry()
      })
    }

    scrollPlaceAttemptsRef.current = 0
    scheduleTry()

    const root = scrollContainerRef.current
    if (root) {
      resizeObserver = new ResizeObserver(() => scheduleTry())
      resizeObserver.observe(root)
    }

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver?.disconnect()
    }
  }, [feedMode, posts, onLandedOnTheirPost, onCouldNotPlaceThem, scrollContainerRef])

  const snapItemSx = {
    flex: '0 0 auto',
    height: '100cqh',
    scrollSnapAlign: 'start',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  } as const

  const catchUpLoading = feedMode.kind === 'puttingYouBack'
  const firstVisitSkeleton = feedMode.kind === 'scrolling' && loading && posts.length === 0
  const hidePostsWhileCatchUp = feedMode.kind === 'puttingYouBack'

  return (
    <Box
      sx={{
        position: 'relative',
        flex: '1 1 0',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: '1 1 0',
          minHeight: 0,
          containerType: 'size',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {firstVisitSkeleton &&
          Array.from({ length: 3 }).map((_, index) => (
            <Box key={`skeleton-initial-${index}`} sx={snapItemSx}>
              <LoadingSkeleton
                skeletonProps={{
                  sx: {
                    height: '100%',
                    aspectRatio: '9/16',
                    maxWidth: '100%',
                    borderRadius: '0.75em'
                  }
                }}
              />
            </Box>
          ))}

        {posts.map((post, index) => (
          <Box
            key={post.id}
            ref={(el: HTMLDivElement | null) => registerPostRowRef(index, el)}
            sx={{
              ...snapItemSx,
              visibility: hidePostsWhileCatchUp ? 'hidden' : 'visible'
            }}
          >
            <PostFeedCard
              post={post}
              onClick={() => {
                noteUserOpenedPost(index, post.id)
                onPostClick(post)
              }}
            />
          </Box>
        ))}

        {loading && posts.length > 0 && feedMode.kind === 'scrolling' && (
          <Box sx={snapItemSx}>
            <LoadingSkeleton
              skeletonProps={{
                sx: {
                  height: '100%',
                  aspectRatio: '9/16',
                  maxWidth: '100%',
                  borderRadius: '0.75em'
                }
              }}
            />
          </Box>
        )}

        {!loading && posts.length === 0 && feedMode.kind === 'scrolling' && (
          <Box sx={{ ...snapItemSx, padding: '2em' }}>
            <Typography variant="body1">No posts found</Typography>
          </Box>
        )}

        {posts.length > 0 && posts.length < totalCount && feedMode.kind === 'scrolling' && (
          <Box ref={sentinelRef} sx={{ height: '1px', scrollSnapAlign: 'start' }} />
        )}
      </Box>
      {catchUpLoading && (
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <CatchUpLoadingOverlay />
        </Box>
      )}
    </Box>
  )
}

export default PostFeedView
