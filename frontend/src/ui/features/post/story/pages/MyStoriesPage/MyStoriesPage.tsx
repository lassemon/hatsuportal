import { Box, Skeleton } from '@mui/material'
import { useAtom } from 'jotai'
import React, { useEffect, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'
import TinyStoryCard from 'ui/features/post/story/components/TinyStoryCard'
import { authAtom } from 'ui/state/authAtom'
import { errorAtom } from 'ui/state/errorAtom'
import { useDataServiceContext } from 'infrastructure/hooks/useDataServiceContext'
import { useNavigate } from 'ui/shared/hooks/useNavigate'

const MyStoriesPage: React.FC = () => {
  const dataServiceContext = useDataServiceContext()
  const [loadingMyStories, setLoadingMyStories] = useState(true)
  const [myStories, setMyStories] = useState<StoryViewModel[]>([])
  const [authState] = useAtom(authAtom)
  const navigate = useNavigate()
  const [, setError] = useAtom(React.useMemo(() => errorAtom, []))

  const myStoriesRequestControllerRef = useRef<AbortController | null>(null)

  const redirectToStory = (story: StoryViewModel) => {
    navigate([
      { href: '/stories', label: 'Stories' },
      { href: `/story/${story.id}`, label: `"${story.name}"` }
    ])
  }

  useEffect(() => {
    if (!authState.loggedIn) {
      navigate([])
    } else {
      const fetchAndSetPageStats = async () => {
        try {
          setLoadingMyStories(true)
          const controller = new AbortController()
          myStoriesRequestControllerRef.current = controller

          const myStoriesResponse = await dataServiceContext.storyService
            .myStories({ signal: controller.signal })
            .finally(() => {
              setLoadingMyStories(false)
            })
            .catch((error) => {
              setError(error)
              return null
            })
          if (myStoriesResponse) {
            unstable_batchedUpdates(() => {
              setMyStories(myStoriesResponse.stories)
            })
          }
        } catch (error) {
          setLoadingMyStories(false)
          console.error('Failed to fetch page stats', error)
        }
      }

      fetchAndSetPageStats()
    }
  }, [authState.loggedIn])

  useEffect(() => {
    return () => {
      myStoriesRequestControllerRef?.current?.abort()
    }
  }, [])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 100%',
        minHeight: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ margin: '1em' }}>
        <Box
          sx={{
            margin: '2em 0 0 0',
            display: 'grid',
            gridTemplateColumns: `repeat(${loadingMyStories ? '6, 0fr' : 'auto-fill, minmax(180px, 1fr)'})`,
            gap: '1em',
            padding: '0em'
          }}
        >
          {loadingMyStories
            ? Array.from(Array(6).keys()).map((index) => {
                return (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    width={120}
                    height={120}
                    animation="wave"
                    sx={{ margin: '0 0 0.5em 0', backgroundColor: 'rgba(0, 0, 0, 0.21)', opacity: 1.0 - index * 0.2 }}
                  />
                )
              })
            : myStories.map((story, index) => {
                return (
                  <span key={`${story.id}-${index}`} onClick={() => redirectToStory(story)}>
                    <TinyStoryCard key={`${story.id}-${index}`} story={story} />
                  </span>
                )
              })}
        </Box>
      </Box>
    </Box>
  )
}

export default MyStoriesPage
