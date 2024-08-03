import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDataServiceContext } from 'infrastructure/hooks/useDataServiceContext'
import { useNavigate } from 'ui/shared/hooks/useNavigate'
import PostLayout from 'ui/shared/layouts/PostLayout'
import StoryEdit from 'ui/features/post/story/components/StoryEdit'
import { useStory } from 'ui/features/post/story/hooks/useStory'
import { StoryViewModel } from 'ui/features/post/story/viewModels/StoryViewModel'
import { UserViewModel } from 'ui/features/user/viewModels/UserViewModel'
import { useAtom } from 'jotai'
import { authAtom } from 'ui/state/authAtom'
import { errorAtom } from 'ui/state/errorAtom'
import { successAtom } from 'ui/state/successAtom'
import { unstable_batchedUpdates } from 'react-dom'
import { ViewModeEnum } from 'application/enums/ViewModeEnum'
import { UpdateStoryRequest } from '@hatsuportal/contracts'
import { ViewStoryLayout } from '../ViewStoryLayout'

const EditStoryLayout: React.FC = () => {
  let { storyId: urlStoryId } = useParams<{ storyId: string }>()
  const [storyUpdateInProgress, setStoryUpdateInProgress] = useState(false)
  const navigate = useNavigate()
  const [authState] = useAtom(authAtom)

  const [viewMode, setViewMode] = useState(ViewModeEnum.View)

  const onToggleViewMode = () => {
    setViewMode(viewMode === ViewModeEnum.View ? ViewModeEnum.Edit : ViewModeEnum.View)
  }

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

  const onUpdate = (updatePayload: UpdateStoryRequest, callback?: () => void) => {
    if (story && updatePayload) {
      if (errorState) {
        setError(null)
      }
      if (authState.loggedIn && authState.user) {
        const controller = new AbortController()
        controllersRef.current.push(controller)
        setStoryUpdateInProgress(true)
        dataServiceContext.storyService
          .update(story.id, updatePayload, { signal: controller.signal })
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
      viewMode={viewMode}
      layoutComponent={<ViewStoryLayout story={story} loadingStory={loadingStory} onToggleViewMode={onToggleViewMode} />}
      editComponent={
        (authState.user?.id === story?.createdById || UserViewModel.isAdmin(authState.user)) && (
          <StoryEdit
            story={story}
            backendStory={backendStory}
            loadingStory={loadingStory}
            setStory={setStoryAndId}
            savingStory={storyUpdateInProgress}
            onUpdate={onUpdate}
            onClose={onToggleViewMode}
            deleteStory={deleteStory}
          />
        )
      }
    />
  )
}

export default EditStoryLayout
