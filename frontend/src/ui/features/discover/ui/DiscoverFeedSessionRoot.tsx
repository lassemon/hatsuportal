import React, { useMemo, useRef } from 'react'
import type { AuthStateDTO } from 'ui/entities/user/state/authAtom'
import { DiscoverFeedSession } from 'ui/features/discover/model/discoverFeedSession'
import { DiscoverViewer } from 'ui/features/discover/model/DiscoverViewer'
import { useDiscoverFeedActivePost } from 'ui/features/discover/model/useDiscoverFeedActivePost'
import { useDiscoverPostFeed } from 'ui/features/discover/model/useDiscoverPostFeed'
import { useStore } from 'jotai'
import { PostFeedView } from './PostFeedView'
import { useSize } from 'ui/shared/hooks/useSize'
import { Box } from '@mui/material'
import LoadingSkeleton from 'ui/shared/ui/LoadingSkeleton/LoadingSkeleton'
import TinyPostCard from 'ui/entities/post/ui/TinyPostCard'
import { StoryViewModel } from 'ui/entities/story/model/StoryViewModel'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import { PostViewModel, PostViewModelDTO } from 'ui/entities/post/model/PostViewModel'

type DiscoverFeedSessionRootProps = {
  authState: AuthStateDTO
}

export const DiscoverFeedSessionRoot: React.FC<DiscoverFeedSessionRootProps> = ({ authState }) => {
  // using store here so that saving where the user is on the feed does not trigger a re-render
  const store = useStore()
  const viewer = DiscoverViewer.fromAuth(authState)
  const sessionKey = viewer.toSessionKey()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const postWeSawThemWatchingRef = useRef<{
    postTheyWereWatching: string
    placeInTheList: number
  } | null>(null)

  const { isSmall } = useSize()
  const navigate = useNavigate()

  const feedSession = useMemo(() => new DiscoverFeedSession(store), [store])

  const whenTheFeedOpens = useMemo(
    () => feedSession.readWhenTheFeedOpens(sessionKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per keyed mount
    []
  )

  const feed = useDiscoverPostFeed(whenTheFeedOpens, feedSession, postWeSawThemWatchingRef)
  const activePost = useDiscoverFeedActivePost({
    posts: feed.posts,
    postWeSawThemWatchingRef,
    feedModeRef: feed.feedModeRef,
    scrollContainerRef,
    rememberTheyWereWatching: feed.rememberTheyWereWatching
  })

  const redirectToPost = (post: PostViewModel<PostViewModelDTO>) => {
    navigate([
      { href: '/stories', label: 'Stories' },
      { href: `/story/${post.id}`, label: `"${post.title}"` }
    ])
  }

  return isSmall ? (
    <PostFeedView
      posts={feed.posts}
      loading={feed.loading}
      totalCount={feed.totalCount}
      startAtTop={feed.startAtTop}
      feedMode={feed.feedMode}
      onLoadMore={feed.loadMore}
      onPostClick={feed.onPostClick}
      onLandedOnTheirPost={feed.onLandedOnTheirPost}
      onCouldNotPlaceThem={feed.onCouldNotPlaceThem}
      scrollContainerRef={scrollContainerRef}
      registerPostRowRef={activePost.registerPostRowRef}
      noteUserOpenedPost={activePost.noteUserOpenedPost}
    />
  ) : (
    <Box
      sx={{
        margin: '2em',
        display: 'grid',
        gridTemplateColumns: `repeat(${feed.loading ? '6, 0fr' : 'auto-fill, minmax(180px, 1fr)'})`,
        gap: '1em',
        padding: '0.5 0em'
      }}
    >
      {feed.loading
        ? Array.from(Array(6).keys()).map((index) => {
            return (
              <LoadingSkeleton
                key={index}
                skeletonProps={{
                  width: 120,
                  height: 120,
                  sx: { margin: '0 0 0.5em 0', backgroundColor: 'rgba(0, 0, 0, 0.21)', opacity: 1.0 - index * 0.15 }
                }}
              />
            )
          })
        : feed.posts.map((story, index) => {
            return (
              <span key={`${story.id}-${index}`} onClick={() => redirectToPost(story)}>
                <TinyPostCard key={`${story.id}-${index}`} post={story} />
              </span>
            )
          })}
    </Box>
  )
}

export default DiscoverFeedSessionRoot
