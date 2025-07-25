import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDataServiceContext } from 'infrastructure/hooks/useDataServiceContext'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import PostLayout from 'ui/shared/layouts/PostLayout'
import StoryCard from 'ui/features/story/components/StoryCard'
import StoryEdit from 'ui/features/story/components/StoryEdit'
import { useStory } from 'ui/features/story/hooks/useStory'
import { StoryViewModel } from 'ui/features/story/viewModels/StoryViewModel'
import { UserViewModel } from 'ui/features/user/viewModels/UserViewModel'
import { useAtom } from 'jotai'
import { authAtom } from 'ui/state/authAtom'
import { errorAtom } from 'ui/state/errorAtom'
import { successAtom } from 'ui/state/successAtom'
import { uuid } from '@hatsuportal/common'
import { unstable_batchedUpdates } from 'react-dom'
import { STORY_DEFAULTS } from 'infrastructure/services/data/StoryService'

const EditStoryLayout: React.FC = () => {
  let { storyId: urlStoryId } = useParams<{ storyId: string }>()
  const [storyUpdateInProgress, setStoryUpdateInProgress] = useState(false)
  const navigate = useNavigate()
  const [authState] = useAtom(authAtom)

  const dataServiceContext = useDataServiceContext()
  const controllersRef = useRef<AbortController[]>([])

  const [errorState, setError] = useAtom(React.useMemo(() => errorAtom, []))
  const [, setSuccess] = useAtom(React.useMemo(() => successAtom, []))

  const [{ story, backendStory, loadingStory }, setStory] = useStory(dataServiceContext.storyService, urlStoryId, {
    persist: true
  })

  useEffect(() => {
    return () => {
      controllersRef.current.forEach((controller) => controller.abort())
    }
  }, [])

  const setStoryAndId = (story: StoryViewModel | null) => {
    // {replace: true} to skip this change in history and thus make back button work properly
    if (story)
      navigate(
        [
          { href: '/stories', label: 'Stories' },
          { href: `/story/${story.id}`, label: `"${story.name}"` }
        ],
        { replace: true }
      )
    setStory(story)
  }

  const onSave = (_story: StoryViewModel | null, callback?: () => void) => {
    if (_story) {
      const shouldGenerateNewId = _story.id === STORY_DEFAULTS.DEFAULT_STORY_ID || _story.id === STORY_DEFAULTS.NEW_STORY_ID
      const newStory = shouldGenerateNewId ? _story.clone({ id: uuid() }) : _story.clone()

      if (errorState) {
        setError(null)
      }
      setStory(newStory)
      if (authState.loggedIn && authState.user) {
        const controller = new AbortController()
        controllersRef.current.push(controller)
        setStoryUpdateInProgress(true)
        dataServiceContext.storyService
          .update(newStory, { signal: controller.signal })
          .then((savedStory) => {
            unstable_batchedUpdates(() => {
              setStory(savedStory)
              setSuccess({ message: `Story "${savedStory.name}" saved succesfully!` })
            })
          })
          .catch((error) => {
            setError(error)
          })
          .finally(() => {
            if (callback) {
              callback()
            }
            setStoryUpdateInProgress(false)
          })
      }
    }
  }

  const deleteStory = () => {
    if (authState.loggedIn && authState.user && story) {
      const controller = new AbortController()
      controllersRef.current.push(controller)
      setStoryUpdateInProgress(true)
      dataServiceContext.storyService
        .delete(story.id, { signal: controller.signal })
        .then((deletedStory) => {
          setSuccess({ message: `Story "${deletedStory.name}" deleted succesfully!` })
          if (deletedStory.id) navigate([{ href: `/stories`, label: 'Stories' }])
        })
        .catch((error) => {
          setError(error)
        })
    }
  }

  return (
    <PostLayout
      layoutComponent={<StoryCard story={story} loadingStory={loadingStory} />}
      editComponent={
        (authState.user?.id === story?.createdById || UserViewModel.isAdmin(authState.user)) && (
          <StoryEdit
            story={story}
            backendStory={backendStory}
            loadingStory={loadingStory}
            setStory={setStoryAndId}
            savingStory={storyUpdateInProgress}
            onSave={onSave}
            deleteStory={deleteStory}
          />
        )
      }
    />
  )
}

export default EditStoryLayout
